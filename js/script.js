/**
 * 1. 초기화 및 전역 변수 설정
 */
document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const modal = document.getElementById('modalContainer');
    const iframe = document.getElementById('contentFrame');
    const closeBtn = document.getElementById('closeModal');
    const popupLinks = document.querySelectorAll('.popup-trigger');
    
    // [PDF.js 설정] 
    // 본인 서버(Github)에 폴더를 올렸다면 'lib/pdfjs/web/viewer.html' 사용
    // 아직 올리기 전이라면 아래의 공식 CDN 주소를 사용해서 테스트하세요.
    const PDFJS_VIEWER = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=';

    /**
     * 2. 연도 자동 업데이트
     */
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }

    /**
     * 3. 모바일 메뉴 기능
     */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    /**
     * 4. 이메일 복사 기능
     */
    const copyButton = document.getElementById('copy-button');
    const textToCopyElement = document.getElementById('text-to-copy');
    const message = document.getElementById('message');

    if (copyButton && textToCopyElement) {
        copyButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const emailText = textToCopyElement.innerText;
            try {
                await navigator.clipboard.writeText(emailText);
                message.style.display = 'block';
                message.style.color = '#00ff88';
                message.innerText = '✅ 이메일 주소가 복사되었습니다!';
                setTimeout(() => {
                    message.innerText = '';
                    message.style.display = 'none';
                }, 2000);
            } catch (err) {
                console.error('클립보드 복사 실패:', err);
            }
        });
    }

    /**
     * 5. 스크롤 애니메이션 (Scroll Reveal)
     */
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => observer.observe(card));

    /**
     * 6. 모달 제어 (유튜브 & PDF.js 통합)
     */
    popupLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const originalUrl = link.getAttribute('href');
            let finalUrl = '';

            // 유튜브 감지
            if (originalUrl.includes('youtu.be') || originalUrl.includes('youtube.com')) {
                let videoId = originalUrl.includes('youtu.be') 
                    ? originalUrl.split('/').pop() 
                    : new URLSearchParams(new URL(originalUrl).search).get('v');
                finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } 
            // PDF 감지 (PDF.js 적용)
            else if (originalUrl.toLowerCase().endsWith('.pdf')) {
                // 전체 경로를 encodeURIComponent로 감싸서 전달
                // #zoom=page-width 옵션으로 콘텐츠 가로폭을 맞춤
                const fullPdfUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + originalUrl;
                finalUrl = `${PDFJS_VIEWER}${encodeURIComponent(originalUrl)}#zoom=page-width`;
            } 
            else {
                finalUrl = originalUrl;
            }

            // iframe에 주소 할당 및 모달 표시
            iframe.src = finalUrl;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 닫기 함수
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            iframe.src = '';
        }, 400);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
});

/**
 * 7. 스크롤 스파이 (Scroll Spy) - DOMContentLoaded 밖에서 실행 가능
 */
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

function changeNav() {
    let current = '';
    if (window.scrollY < 100) {
        current = 'home';
    } else {
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
    }

    navItems.forEach(a => {
        a.classList.remove('active');
        const href = a.getAttribute('href');
        if (current && href && href.includes(current)) {
            a.classList.add('active');
        }
    });
}

window.addEventListener('scroll', changeNav);
window.addEventListener('load', changeNav);


const images = [
  'https://ye-ji-bom.github.io/portfolio-edu/img/main-bg.jpg'
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=2670',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=2000'
];

let currentIdx = -1;
const layers = [document.getElementById('bg-image-1'), document.getElementById('bg-image-2')];
let activeLayerIdx = 0;

function changeBackground() {
  // 1. 랜덤 이미지 선택 (이전과 중복되지 않게)
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * images.length);
  } while (nextIdx === currentIdx);
  currentIdx = nextIdx;

  // 2. 레이어 교체 (디졸브)
  const nextLayerIdx = (activeLayerIdx + 1) % 2;
  const currentLayer = layers[activeLayerIdx];
  const nextLayer = layers[nextLayerIdx];

  nextLayer.style.backgroundImage = `url('${images[currentIdx]}')`;
  nextLayer.classList.add('active');
  currentLayer.classList.remove('active');

  activeLayerIdx = nextLayerIdx;
}

// 초기 실행 및 주기적 반복 (10초마다 교체)
changeBackground();
setInterval(changeBackground, 2000);