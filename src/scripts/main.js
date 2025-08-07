document.addEventListener('DOMContentLoaded', function() {
    var menuIcon = document.querySelector('.menu-icon');
    var navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });

    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });

    navMenu.addEventListener('mouseover', function() {
        navMenu.classList.add('show');
    });

    navMenu.addEventListener('mouseout', function() {
        navMenu.classList.remove('show');
    });
});