(function() {
    function detectDevice() {
        const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (document.body) {
            if (isMobile) {
                document.body.classList.add('layout-mobile');
                document.body.classList.remove('layout-laptop');
            } else {
                document.body.classList.add('layout-laptop');
                document.body.classList.remove('layout-mobile');
            }
        }
    }

    // Run on init once body is available
    document.addEventListener('DOMContentLoaded', detectDevice);

    // Re-run on resize
    window.addEventListener('resize', detectDevice);
})();
