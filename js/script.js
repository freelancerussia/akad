// $(document).ready(function () {
//    $('.control__link').click(function (e) {
//       e.preventDefault();
//       const value = $(this).attr('data-filter');
//       if (value == '_all') {
//          $('.portfolio__image').show('1000');
//          console.log(value);
//       }
//       else {
//          $('.portfolio__image').not('.' + value).hide('1000');
//          $('.portfolio__image').filter('.' + value).show('1000');
//          console.log(value);
//       }
//    })
//    $('.control__link').click(function () {
//       $(this).addClass('_active').siblings().removeClass('_active');
//       // $(this).toggleClass('_active');
//    })
// })

// init Isotope
var $grid = $('.grid').isotope({
   itemSelector: '.grid-item',
   layoutMode: 'masonry',
});

$('#filters').on('click', 'button', function () {
   var filterValue = $(this).attr('data-filter');
   $grid.isotope({ filter: filterValue });
});

$('.button-group').each(function (i, buttonGroup) {
   var $buttonGroup = $(buttonGroup);
   $buttonGroup.on('click', 'button', function () {
      $buttonGroup.find('._active').removeClass('_active');
      $(this).addClass('_active');

   });
});

//анимация 

const animItems = document.querySelectorAll('._anim-items'); //_anim-items добавить туда, где хотим анимировать


//проверяем,существуют ли такие классы
if (animItems.length > 0) {
	window.addEventListener('scroll', animOnScroll); //событие при скролле
	function animOnScroll() {
		for (let index = 0; index < animItems.length; index++) {
			const animItem = animItems[index];
			const animItemHeight = animItem.offsetHeight; //получаем высоту нашего объекта
			const animItemOffset = offset(animItem).top; //получаем позицию объекта относительно верха (на сколько объект ниже, чем верх)
			const animStart = 3; //коэффициент, регулирующий момент старта анимации

			let animItemPoint = window.innerHeight - animItemHeight / animStart; //высота окна браузера минуc высоту объекта поделенный на коэффициент
			if (animItemHeight > window.innerHeight) { //если высота объекта выше высоты окна браузера
				animItemPoint = window.innerHeight - window.innerHeight / animStart;
			}

			//если прокрутили больше чем позиция объекта минус точка старта, но при этом прокрутили меньше чем позиция объекта плюс его высота
			if ((pageYOffset > animItemOffset - animItemPoint) && pageYOffset < (animItemOffset + animItemHeight)) {
				animItem.classList.add('_active'); //анимация
			} else {
				if (!animItem.classList.contains('_anim-no-hide')) {  //запрет второй ранз анимации
					animItem.classList.remove('_active');
				}
			}
		}
	}
	//функция для получения знаяения позиции объекта относительно верха и лева
	function offset(el) {
		const rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}

	setTimeout(() => {
		animOnScroll();
	}, 300);
}
class DynamicAdapt {
  constructor(type) {
    this.type = type;
  }

  init() {
    // массив объектов
    this.оbjects = [];
    this.daClassname = '_dynamic_adapt_';
    // массив DOM-элементов
    this.nodes = [...document.querySelectorAll('[data-da]')];

    // наполнение оbjects объктами
    this.nodes.forEach((node) => {
      const data = node.dataset.da.trim();
      const dataArray = data.split(',');
      const оbject = {};
      оbject.element = node;
      оbject.parent = node.parentNode;
      оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
      оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : '767';
      оbject.place = dataArray[2] ? dataArray[2].trim() : 'last';
      оbject.index = this.indexInParent(оbject.parent, оbject.element);
      this.оbjects.push(оbject);
    });

    this.arraySort(this.оbjects);

    // массив уникальных медиа-запросов
    this.mediaQueries = this.оbjects
      .map(({
        breakpoint
      }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
      .filter((item, index, self) => self.indexOf(item) === index);

    // навешивание слушателя на медиа-запрос
    // и вызов обработчика при первом запуске
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(',');
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];

      // массив объектов с подходящим брейкпоинтом
      const оbjectsFilter = this.оbjects.filter(
        ({
          breakpoint
        }) => breakpoint === mediaBreakpoint
      );
      matchMedia.addEventListener('change', () => {
        this.mediaHandler(matchMedia, оbjectsFilter);
      });
      this.mediaHandler(matchMedia, оbjectsFilter);
    });
  }

  // Основная функция
  mediaHandler(matchMedia, оbjects) {
    if (matchMedia.matches) {
      оbjects.forEach((оbject) => {
        оbject.index = this.indexInParent(оbject.parent, оbject.element);
        this.moveTo(оbject.place, оbject.element, оbject.destination);
      });
    } else {
      оbjects.forEach(
        ({ parent, element, index }) => {
          if (element.classList.contains(this.daClassname)) {
            this.moveBack(parent, element, index);
          }
        }
      );
    }
  }

  // Функция перемещения
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    if (place === 'last' || place >= destination.children.length) {
      destination.append(element);
      return;
    }
    if (place === 'first') {
      destination.prepend(element);
      return;
    }
    destination.children[place].before(element);
  }

  // Функция возврата
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== undefined) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }

  // Функция получения индекса внутри родителя
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }

  // Функция сортировки массива по breakpoint и place 
  // по возрастанию для this.type = min
  // по убыванию для this.type = max
  arraySort(arr) {
    if (this.type === 'min') {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === 'first' || b.place === 'last') {
            return -1;
          }
          if (a.place === 'last' || b.place === 'first') {
            return 1;
          }
          return a.place - b.place;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === 'first' || b.place === 'last') {
            return 1;
          }
          if (a.place === 'last' || b.place === 'first') {
            return -1;
          }
          return b.place - a.place;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}

const da = new DynamicAdapt("max");
da.init();


$(document).ready(function () {
   $('.burger').click(function (event) {
      $('.burger').toggleClass('_active');
      $('.menu__list').toggleClass('_active');
      $('.footer__menu .menu__list').removeClass('_active');
      // $('body').toggleClass('lock');
   });
});



document.querySelector('.burger').onclick = function () { //добавляет body класс lock при высоте экрана меньше 670
   if (window.innerHeight <= 670) {
      body.classList.toggle('lock');

   }
}



let isMobile = {
   Android: function () { return navigator.userAgent.match(/Android/i); },
   BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); },
   iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
   Opera: function () { return navigator.userAgent.match(/Opera Mini/i); },
   Windows: function () { return navigator.userAgent.match(/IEMobile/i); },
   any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
};
let body = document.querySelector('body');
if (isMobile.any()) {
   body.classList.add('touch');
   let arrow = document.querySelectorAll('.arrow');
   for (i = 0; i < arrow.length; i++) {
      let thisLink = arrow[i].previousElementSibling;
      let subMenu = arrow[i].nextElementSibling;
      let thisArrow = arrow[i];

      thisLink.classList.add('_parent');
      arrow[i].addEventListener('click', function () {
         subMenu.classList.toggle('_open');
         thisArrow.classList.toggle('_active');
      });
   }
} else {
   body.classList.add('mouse');
}

let inputEmail = document.getElementById('input__email');
$('.form__placeholder').click(function () {
   $(inputEmail).focus();                          //добавляет класс при фокусe input
   $('.form__placeholder').addClass('_active');
});

$(inputEmail)
   .focus(
      function () {
         $('.form__placeholder').addClass('_active'); //удаляет класс при потере фокуса input
      }
   );

$(inputEmail)
   .blur(
      function () {
         var $this = $(this),
            val = $this.val();
         var hasFocus = $(this).is(':focus');

         if (val.length == 0 && !hasFocus) {
            $('.form__placeholder').removeClass('_active');    //удаляет класс при потере фокуса input и пустом поле
         } else {
            $('.form__placeholder').addClass('_active');
         }
      }
   );

function ibg() {

   $.each($('.ibg'), function (index, val) {
      if ($(this).find('img').length > 0) {
         $(this).css('background-image', 'url("' + $(this).find('img').attr('src') + '")');
      }
   });
}

ibg();


let tab1 = document.getElementById('tab-1');
let tab2 = document.getElementById('tab-2');
let tab3 = document.getElementById('tab-3');

let link1 = document.getElementById('link-1');
let link2 = document.getElementById('link-2');
let link3 = document.getElementById('link-3');

let nav = document.querySelector('.tabs__nav');

link1.onclick = function () {
   nav.classList.add('link-1');
   if (nav.classList.contains('link-2')) {
      nav.classList.remove('link-2');
   }
   if (nav.classList.contains('link-3')) {
      nav.classList.remove('link-3');
   }
   //!---------------------------
   link1.classList.add('_active');
   if (link2.classList.contains('_active')) {
      link2.classList.remove('_active');
   }
   if (link3.classList.contains('_active')) {
      link3.classList.remove('_active');
   }
   //!---------------------------
   tab1.classList.add('_active');
   if (tab2.classList.contains('_active')) {
      tab2.classList.remove('_active');
   }
   if (tab3.classList.contains('_active')) {
      tab3.classList.remove('_active');
   }

}
link2.onclick = function () {
   nav.classList.add('link-2');
   if (nav.classList.contains('link-1')) {
      nav.classList.remove('link-1');
   }
   if (nav.classList.contains('link-3')) {
      nav.classList.remove('link-3');
   }
   //!------------------------
   link2.classList.add('_active');
   if (link1.classList.contains('_active')) {
      link1.classList.remove('_active');
   }
   if (link3.classList.contains('_active')) {
      link3.classList.remove('_active');
   }
   //!---------------------------
   if (tab1.classList.contains('_active')) {
      tab1.classList.remove('_active');
   }
   tab2.classList.add('_active');
   if (tab3.classList.contains('_active')) {
      tab3.classList.remove('_active');
   }

}
link3.onclick = function () {
   nav.classList.add('link-3');
   if (nav.classList.contains('link-2')) {
      nav.classList.remove('link-2');
   }
   if (nav.classList.contains('link-1')) {
      nav.classList.remove('link-1');
   }
   //!---------------------------
   link3.classList.add('_active');
   if (link2.classList.contains('_active')) {
      link2.classList.remove('_active');
   }
   if (link1.classList.contains('_active')) {
      link1.classList.remove('_active');
   }
   //!---------------------------
   if (tab1.classList.contains('_active')) {
      tab1.classList.remove('_active');
   }
   if (tab2.classList.contains('_active')) {
      tab2.classList.remove('_active');
   }

   tab3.classList.add('_active');
}


//swiper
// var mySwiper = new Swiper('.swiper-container', {
//    // Optional parameters
//    direction: 'vertical',
//    loop: true,

//    // If we need pagination
//    pagination: {
//       el: '.swiper-pagination',
//    },

//    // Navigation arrows
//    navigation: {
//       nextEl: '.swiper-button-next',
//       prevEl: '.swiper-button-prev',
//    },

//    // And if we need scrollbar
//    scrollbar: {
//       el: '.swiper-scrollbar',
//    },
// })