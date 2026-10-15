/* Consultation form — posts to the Pages Function at /api/contact and shows the result inline. */
(function () {
  var form = document.getElementById('consult-form');
  if (!form) return;
  var btn = document.getElementById('consult-submit');
  var status = document.getElementById('consult-status');

  function show(kind, msg) {
    status.textContent = msg;
    status.className = kind;
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.hidden = true;

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          show('ok', 'Thanks — your request is in. Bo will follow up to set a time to walk the space.');
        } else {
          show('err', res.error || 'Could not send right now. Call or text (314) 489-6439 instead.');
        }
      })
      .catch(function () {
        show('err', 'Could not send right now. Call or text (314) 489-6439 instead.');
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
  });
})();
