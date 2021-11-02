export default function (text, defaultUrl = null) {
    let photodiv = document.createElement('div');
    photodiv.insertAdjacentHTML('afterbegin', text);
    let firstImg = photodiv.getElementsByTagName('img')[0];

    return firstImg ? firstImg.getAttribute('src') : defaultUrl;
}