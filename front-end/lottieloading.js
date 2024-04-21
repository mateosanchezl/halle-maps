window.onload = function() {
    var animation = lottie.loadAnimation({
      container: document.getElementById('lottie-animation'), // the dom element that will contain the animation
      renderer: 'svg', // renderer to use
      loop: true, // loop the animation
      autoplay: true, // automatically start the animation
      path: './instrument.json' // the path to the animation json
    });
  };