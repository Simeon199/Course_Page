let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("image-wrapper");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.opacity = "0";
    slides[i].style.transition = "opacity 0.8s ease-in-out";
    // slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1
  }  
  slides[slideIndex-1].style.opacity = "1";
  // slides[slideIndex-1].style.display = "block";  
  setTimeout(showSlides, 4000);
}