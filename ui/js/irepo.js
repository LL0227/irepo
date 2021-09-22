'use strict';

let picker_button = null;
let selectedFile = null;

function login() {
    let form = document.getElementById('login_form');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    let payload = {
        email: $('#email').val(),
        password: $('#password').val()
    };

    return fetch('/v1/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then((response) => {
        return response.json();
    }).then((result) => {
        if (result.success) {
            window.localStorage.setItem('access_token', result.access_token);
            window.localStorage.setItem('userid', result.userid);
            window.localStorage.setItem('email', result.email);
 
            window.location.href = 'index.html';
        } else {
            alert(result.message);
        }
    });
}

function logout() {
    let userid = window.localStorage.getItem('userid');
    let access_token = window.localStorage.getItem('access_token');
    let payload = {
        userid: userid
    };

    return fetch('/v1/logout', {
        method: 'POST',
        headers: {
            'jwt-token': access_token
        },
        body: JSON.stringify(payload)
    }).then((response) => {
        return response.json();
    }).then((result) => {
        window.location.href = 'login.html';
        return result;
    });
}

function loadImages() {
    let userid = window.localStorage.getItem('userid');
    let access_token = window.localStorage.getItem('access_token');
    let url = '/v1/users/' + userid + '/images';

    return fetch(url, {
        method: 'GET',
        headers: {
            'jwt-token': access_token
        }
    }).then((response) => {
        return response.json();
    }).then((result) => {
        showImages(result);
        return result;
    });
}

function uploadNewImage() {
    let html = 
            '<div class="fsp-drop-area-container">' +
                '<div class="fsp-drop-area" onclick="uploadImageHandler()">' +
                    '<div class="fsp-select-labels">' +
                        '<div class="fsp-drop-area__title fsp-text__title">Select a file to upload</div>' +
                    '</div>' +
                    '<input id="upload_file" name="files[]" type="file" accept="image/*" class="fsp-local-source__fileinput" onchange="OnImageFileSelected(this)">' +
                '</div>' +
            '</div>';
    $("#image_transformer").html(html + createFooter());
    $('#image_picker').show();
}

function uploadImageHandler () {
    const input = document.querySelector('#upload_file');
    input.value = '';
    input.click();
}

function OnImageFileSelected(input) {
    if (input.files && input.files[0]) {
        selectedFile = input.files[0];

        let html = '<div><img id="picker_image" style="max-width: 100%;" src="" /></div>';
        $("#image_transformer").html(html + createFooter());

        let image = document.getElementById('picker_image');
        image.src = URL.createObjectURL(selectedFile);

        $('#upload_btn').removeAttr('disabled');
    }
}

function uploadFile() {
    let access_token = window.localStorage.getItem('access_token');
    let formData = new FormData();

    formData.append('files[]', selectedFile);

    $.ajax({
        url: '/v1/uploader',
        method: 'POST',
        data: formData,
        async: true,
        cache: false,
        contentType: false,
        processData: false,
        headers: {
            'jwt-token': access_token
        },
        success: function(data) {
            if (data.success) {
                window.location.href = 'index.html';
            }
        },
        error: function(xhr) {}
    });
}

function showImages(images) {
    let userid = window.localStorage.getItem('userid');
    let count = 0;

    images.forEach(function(img) {
        let rowId = 'tr_' + count;
        let url = '/v1/viewer/' + userid + '/images/' + img.id;
        let wrapper = '<div class="img-bg" style="background-image:url(' + url + ')"></div>';
        let html = 
            '<tr id="' + rowId + '">' + 
                '<td>' + wrapper + '</td>' +
                '<td><button class="btn btn-danger" onclick="deleteImg(\'' + img.id + '\',\'' + rowId + '\')">Delete</button></td>' +
            '</tr>';
        $('#repos').append(html);

        count++;
    });
}

function deleteImg(id, rowId) {
    let userid = window.localStorage.getItem('userid');
    let access_token = window.localStorage.getItem('access_token');
    let url = '/v1/users/' + userid + '/images/' + id;

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'jwt-token': access_token
        }
    }).then((response) => {
        return response.json();
    }).then((result) => {
        console.log(result);
        if (result.success) {
            $('#' + rowId).remove();
        }
        return result;
    });
}

function closePicker() {
    $('#image_picker').hide();
}

function createFooter() {
    let html =
        '<div class="fsp-footer fsp-footer--appeared" slot="footer">' +
            '<div class="fsp-footer__nav">' +
                '<div class="d-flex justify-content-between">' +
                    '<button id="upload_btn" class="btn btn-primary btn-sm" onclick="uploadFile()" disabled>Save</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    return html;
}
