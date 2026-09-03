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
      () => ({ name: '', description: '', link: '' }),
      (item, onChange) => [
        inputRow([
          textField('Project name', item.name, (v) => onChange({ ...item, name: v })),
          textField('Link', item.link, (v) => onChange({ ...item, link: v })),
        ]),
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

