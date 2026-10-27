document.getElementById('form').addEventListener('submit', e => { e.preventDefault(); e.target.querySelector('.success').hidden = false; e.target.reset(); });
