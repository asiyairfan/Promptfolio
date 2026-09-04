import { uploadProjectImage } from '../api.js';
import { el } from '../dom.js';

export function renderReview(state, dispatch) {
  const resume = state.resume;

  function updateResume(patch) {
    dispatch({ type: 'setResume', payload: { ...resume, ...patch } });
  }

  function updateContact(patch) {
    updateResume({ contact: { ...resume.contact, ...patch } });
  }

  function updateList(key, list) {
    updateResume({ [key]: list });
  }

  function move(list, idx, dir) {
    const next = [...list];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    updateList(keyFor(list), next);
  }

  function keyFor(list) {
    if (list === resume.experience) return 'experience';
    if (list === resume.education) return 'education';
    if (list === resume.projects) return 'projects';
    return 'skills';
  }

  const warnings = state.warnings?.length
    ? el('div', { class: 'warning-banner' }, `AI parser notes: ${state.warnings.join('; ')}`)
    : null;

  const SINGULAR = {
    experience: 'experience',
    education: 'education',
    projects: 'project',
  };

  const container = el('div', {}, [
    el('h2', {}, 'Review & edit'),
    el('p', { class: 'lead' }, 'Fix anything the AI missed before you style and publish.'),
    warnings,
    el('h3', {}, 'Profile'),
    inputRow([
      textField('Name', resume.name, (v) => updateResume({ name: v })),
      textField('Title', resume.title, (v) => updateResume({ title: v })),
    ]),
    textareaField('Summary', resume.summary, (v) => updateResume({ summary: v })),

    el('h3', {}, 'Contact'),
    inputRow([
      textField('Email', resume.contact.email, (v) => updateContact({ email: v })),
      textField('Phone', resume.contact.phone, (v) => updateContact({ phone: v })),
    ]),
    inputRow([
      textField('Location', resume.contact.location, (v) => updateContact({ location: v })),
      textField('Website / LinkedIn', resume.contact.website, (v) => updateContact({ website: v })),
    ]),
    inputRow([
      textField('Avatar URL', resume.contact.avatarUrl, (v) => updateContact({ avatarUrl: v })),
    ]),

    el('h3', {}, 'Experience'),
    listEditor(
      resume.experience,
      'experience',
      () => ({ role: '', organization: '', dates: '', description: '' }),
      (item, onChange) => [
        inputRow([
          textField('Role', item.role, (v) => onChange({ ...item, role: v })),
          textField('Organization', item.organization, (v) => onChange({ ...item, organization: v })),
        ]),
        textField('Dates', item.dates, (v) => onChange({ ...item, dates: v })),
        textareaField('Description', item.description, (v) => onChange({ ...item, description: v })),
      ]
    ),

    el('h3', {}, 'Education'),
    listEditor(
      resume.education,
      'education',
      () => ({ degree: '', institution: '', dates: '', details: '' }),
      (item, onChange) => [
        inputRow([
          textField('Degree', item.degree, (v) => onChange({ ...item, degree: v })),
          textField('Institution', item.institution, (v) => onChange({ ...item, institution: v })),
        ]),
        textField('Dates', item.dates, (v) => onChange({ ...item, dates: v })),
        textareaField('Details', item.details, (v) => onChange({ ...item, details: v })),
      ]
    ),

    el('h3', {}, 'Projects'),
    listEditor(
      resume.projects,
      'projects',
      () => ({ name: '', description: '', link: '', imageUrl: '' }),
      (item, onChange) => [
        inputRow([
          textField('Project name', item.name, (v) => onChange({ ...item, name: v })),
          textField('Link', item.link, (v) => onChange({ ...item, link: v })),
        ]),
        imageField(item.imageUrl || '', (v) => onChange({ ...item, imageUrl: v })),
        textareaField('Description', item.description, (v) => onChange({ ...item, description: v })),
      ]
    ),

    el('h3', {}, 'Skills'),
    skillsEditor(resume.skills, (skills) => updateResume({ skills })),

    el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setStep', payload: 0 }) }, 'Back'),
      el('button', { class: 'btn btn-primary', onclick: () => dispatch({ type: 'setStep', payload: 2 }) }, 'Next: Style & preview'),
    ]),
]);

  function listEditor(list, key, makeItem, renderFields) {
    const wrapper = el('div', { class: 'list-editor' });

    function refresh() {
      wrapper.innerHTML = '';
      list.forEach((item, idx) => {
        const onChange = (nextItem) => {
          const next = [...list];
          next[idx] = nextItem;
          updateList(key, next);
          refresh();
        };
        const head = el('div', { class: 'item-head' }, [
          el('h4', {}, `${key.slice(0, 1).toUpperCase() + key.slice(1)} ${idx + 1}`),
          el('div', {}, [
            el('button', { class: 'btn btn-secondary', disabled: idx === 0, onclick: () => moveList(idx, -1) }, '↑'),
            el('button', { class: 'btn btn-secondary', disabled: idx === list.length - 1, onclick: () => moveList(idx, 1) }, '↓'),
            el('button', { class: 'btn btn-danger', onclick: () => remove(idx) }, 'Remove'),
          ]),
        ]);
        const body = el('div', {}, renderFields(item, onChange));
        wrapper.appendChild(el('div', { class: 'item' }, [head, body]));
      });
    }

    function moveList(idx, dir) {
      const next = [...list];
      const swap = idx + dir;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      updateList(key, next);
      refresh();
    }

    function remove(idx) {
      const next = list.filter((_, i) => i !== idx);
      updateList(key, next);
      refresh();
    }

    refresh();

    return el('div', {}, [
      wrapper,
      el('button', {
        class: 'btn btn-secondary',
        onclick: () => {
          updateList(key, [...list, makeItem()]);
          refresh();
        },
      }, `Add ${SINGULAR[key] || key}`),
    ]);
  }

  function skillsEditor(skills, onChange) {
    let input;
    const chips = el('div', { class: 'chip-list' });

    function refresh() {
      chips.innerHTML = '';
      skills.forEach((skill, idx) => {
        chips.appendChild(el('span', { class: 'chip' }, [
          skill,
          el('button', { onclick: () => onChange(skills.filter((_, i) => i !== idx)) }, '×'),
        ]));
      });
    }

    function add() {
      const v = input.value.trim();
      if (!v) return;
      onChange([...skills, v]);
      input.value = '';
      input.focus();
      refresh();
    }

    input = el('input', {
      type: 'text',
      placeholder: 'Add a skill and press Enter',
      onkeydown: (e) => e.key === 'Enter' && (e.preventDefault(), add()),
    });

    refresh();

    return el('div', { class: 'form-group' }, [
      el('div', { class: 'form-row' }, [
        input,
        el('button', { class: 'btn btn-secondary', onclick: add }, 'Add'),
      ]),
      chips,
    ]);
  }

  return container;
}

function inputRow(children) {
  return el('div', { class: 'form-row' }, children);
}

function textField(label, value, onChange) {
  const input = el('input', {
    type: 'text',
    value,
    oninput: (e) => onChange(e.target.value),
  });
  return el('div', { class: 'form-group' }, [
    el('label', {}, label),
    input,
  ]);
}

function imageField(value, onChange) {
  const isDataUri = /^data:image\/(jpeg|png);base64,/i.test(value || '');
  const valid = !value || isValidImageUrl(value);
  const hint = valid
    ? 'Paste a public image URL or upload an image file.'
    : 'Use a complete public http(s) URL or upload an image file.';

  let inputOrPreview;
  if (isDataUri) {
    inputOrPreview = el('div', { class: 'image-upload-preview' }, [
      el('img', { src: value, alt: 'Project preview' }),
      el('button', {
        class: 'btn btn-secondary btn-sm',
        onclick: () => onChange(''),
      }, 'Remove image'),
    ]);
  } else {
    inputOrPreview = el('input', {
      type: 'url',
      inputmode: 'url',
      value,
      placeholder: 'https://example.com/project-preview.jpg',
      class: valid ? '' : 'input-invalid',
      'aria-invalid': !valid || undefined,
      oninput: (e) => onChange(e.target.value),
    });
  }

  const fileInput = el('input', {
    type: 'file',
    accept: 'image/*',
    class: 'image-file-input',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = '';
      if (file.size > 5 * 1024 * 1024) {
        window.alert('Image must be smaller than 5 MB.');
        return;
      }
      try {
        const image = await downscaleImage(file);
        const filename = image.type === 'image/png' ? 'project.png' : 'project.jpg';
        const { url } = await uploadProjectImage(image, filename);
        onChange(url);
      } catch {
        window.alert('Could not upload the image. Try another image under 5 MB.');
      }
    },
  });

  return el('div', { class: 'form-group' }, [
    el('label', {}, 'Project image (optional)'),
    inputOrPreview,
    fileInput,
    el('p', { class: valid ? 'field-hint' : 'field-hint field-hint-error' }, hint),
  ]);
}

function isValidImageUrl(value) {
  if (!value) return true;
  if (/^data:image\/(jpeg|png);base64,/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function downscaleImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Could not process the image.'));
        }, mime, quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function textareaField(label, value, onChange) {
  const input = el('textarea', {
    oninput: (e) => onChange(e.target.value),
  });
  input.value = value;
  return el('div', { class: 'form-group' }, [
    el('label', {}, label),
    input,
  ]);
}

