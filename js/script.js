// 1. 연도 자동 업데이트
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear();
}

// 2. 모바일 메뉴 기능 (수정됨)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
// nav-links 안의 모든 a 태그(링크)를 가져옵니다.
const links = document.querySelectorAll('.nav-links a');

// 햄버거 버튼 클릭 시 메뉴 열기/닫기
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active'); // 메뉴판 보이기/숨기기
    hamburger.classList.toggle('active'); // 햄버거 버튼 X자로 변신
});

// 메뉴 안에 있는 링크를 클릭했을 때 메뉴 닫기
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active'); // 메뉴판 숨기기
        hamburger.classList.remove('active'); // 햄버거 버튼 원래대로
    });
});

// 3. 이메일 복사 기능
const copyButton = document.getElementById('copy-button');
const textToCopyElement = document.getElementById('text-to-copy');
const message = document.getElementById('message');

if(copyButton && textToCopyElement) {
    copyButton.addEventListener('click', async (event) => {
        event.preventDefault(); 
        
        const emailText = textToCopyElement.innerText;

        try {
            await navigator.clipboard.writeText(emailText);
            
            message.style.display = 'block'; // 메시지 보이게 설정
            message.style.color = '#00ff88'; 
            message.innerText = '✅ 이메일 주소가 복사되었습니다!';
            
            setTimeout(() => {
                message.innerText = '';
                message.style.display = 'none'; // 메시지 다시 숨김
            }, 2000);

        } catch (err) {
            console.error('클립보드 복사 실패:', err);
            message.style.display = 'block';
            message.style.color = '#ff4444';
            message.innerText = '❌ 복사에 실패했습니다.';
        }
    });
}

/* ... 기존 코드들 아래에 추가 ... */

// 4. 스크롤 애니메이션 (Scroll Reveal)
const observerOptions = {
    root: null, // 뷰포트 기준
    rootMargin: '0px',
    threshold: 0.1 // 요소가 10% 정도 보이면 애니메이션 실행
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // 요소가 화면에 들어오면
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // 클래스 추가 (CSS 애니메이션 발동)
            observer.unobserve(entry.target); // 한 번 실행 후 감시 종료 (성능 최적화)
        }
    });
}, observerOptions);

// 감시할 대상 선택 (.project-card 모두)
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    observer.observe(card);
});

// 5. 스크롤 스파이 (수정됨: Home 인식 개선)
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

function changeNav() {
    let current = '';

    // [핵심 해결책] 스크롤이 최상단 근처(100px 이내)라면 무조건 'home'으로 설정
    if (window.scrollY < 100) {
        current = 'home';
    } else {
        // 그 외의 경우에는 각 섹션의 위치를 계산
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // 네비게이션 바 높이 등을 고려해 여유값(-150px)을 넉넉히 줍니다.
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
    }

    navItems.forEach(a => {
        a.classList.remove('active');
        // href 속성에 current ID가 포함되어 있는지 확인
        if (current && a.getAttribute('href').includes(current)) {
            a.classList.add('active');
        }
    });
}

// 스크롤 할 때마다 실행
window.addEventListener('scroll', changeNav);

// [추가] 페이지가 로딩되자마자 한 번 실행 (처음부터 색이 들어오게 하기 위함)
window.addEventListener('load', changeNav);

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const modal = document.getElementById('modalContainer');
    const iframe = document.getElementById('contentFrame');
    const closeBtn = document.getElementById('closeModal');
    
    // 팝업으로 띄우고 싶은 링크들에 'popup-trigger'라는 클래스를 추가해야 합니다.
    // 아래 코드는 'popup-trigger' 클래스가 붙은 모든 a 태그를 찾습니다.
    const popupLinks = document.querySelectorAll('.popup-trigger');

    // 2. 링크 클릭 이벤트 처리 (유튜브 자동 감지 기능 추가)
    popupLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        let originalUrl = link.getAttribute('href');
        let finalUrl = '';

        // 1. 아이폰(iOS) 여부 확인
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (originalUrl.includes('youtu.be') || originalUrl.includes('youtube.com')) {
            // 유튜브 로직 (동일)
            // ...
        } else if (isIOS && originalUrl.toLowerCase().endsWith('.pdf')) {
            // 아이폰에서 PDF를 볼 때만 '느리지만 확실한' 구글 뷰어 사용
            finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`;
        } else {
            // PC나 안드로이드는 '매우 빠른' 브라우저 기본 뷰어 사용
            finalUrl = originalUrl;
        }

        iframe.src = finalUrl;
        modal.classList.add('active');
    });
});

    // 3. 닫기 기능 함수 (애니메이션 동기화 수정)
    const closeModal = () => {
        modal.classList.remove('active'); // 1. 먼저 투명하게 만듦 (CSS 애니메이션 시작)
        document.body.style.overflow = ''; 

        // 2. CSS 트랜지션 시간(0.4초)만큼 기다렸다가 iframe 내용 초기화
        setTimeout(() => {
            iframe.src = ''; 
        }, 400); // CSS transition이 0.4s 이므로 400ms 대기
    };
    // 4. 닫기 버튼 클릭 시
    closeBtn.addEventListener('click', closeModal);

    // 5. 모달 바깥 영역(어두운 배경) 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});


const images = [
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