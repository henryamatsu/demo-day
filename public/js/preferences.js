document.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(event.target);
    let formJSON = {};

    for (const [key, value] of formData.entries()) {
        formJSON[key] = value;
    }

    formJSON = JSON.stringify(formJSON);

    fetch(event.target.action, {
        method: event.target.method,
        headers: {'Content-Type': 'application/json'},
        body: formJSON
    });
});

