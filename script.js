import { gsap } from "gsap";

const INTRO_STORAGE_KEY = "daxi-portfolio-intro-v2";
const portfolioIntro = document.querySelector("[data-portfolio-intro]");
const portfolioCard = document.querySelector("[data-portfolio-card]");
const introSkip = document.querySelector("[data-intro-skip]");
const introOpen = document.querySelector("[data-intro-open]");
const replayIntro = document.querySelector("[data-replay-intro]");
const introScene = document.querySelector("[data-intro-scene]");
const introCharacter = document.querySelector(".intro-character");
const paperGhostMask = document.querySelector("[data-paper-ghost-mask]");
const introCursor = document.querySelector(".intro-open-cursor");
const introHero = document.querySelector("[data-intro-hero]");
const portfolioName = document.querySelector("[data-portfolio-name]");
const portfolioEdition = document.querySelector("[data-portfolio-edition]");
const portfolioSelected = document.querySelector("[data-portfolio-selected]");
const portfolioYears = document.querySelector("[data-portfolio-years]");
const portfolioTags = document.querySelector("[data-portfolio-tags]");
const coverDetails = [...document.querySelectorAll("[data-cover-detail]")];
const heroIdentity = document.querySelector(".hero-identity");
const heroRole = document.querySelector(".chapter-intro .eyebrow span");
const heroYears = document.querySelector(".chapter-intro .eyebrow b");
const heroTitle = document.querySelector(".chapter-intro h1");
const heroCta = document.querySelector(".chapter-intro .action-primary");

const introAsset = {
  width: 2848,
  height: 1600,
  paper: { x: 1248, y: 474, width: 406, height: 560 },
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 720px)").matches;
let introTimeline;
let introEntranceTimeline;
let introPlaying = false;

function getIntroImageLayout() {
  const scale = Math.max(window.innerWidth / introAsset.width, window.innerHeight / introAsset.height);
  const renderedWidth = introAsset.width * scale;
  const renderedHeight = introAsset.height * scale;
  return {
    scale,
    offsetX: (window.innerWidth - renderedWidth) / 2,
    offsetY: (window.innerHeight - renderedHeight) / 2,
  };
}

function alignIntroLayers() {
  if (!portfolioIntro || portfolioIntro.hidden || introPlaying) return;
  const layout = getIntroImageLayout();
  const paper = introAsset.paper;
  const left = layout.offsetX + paper.x * layout.scale;
  const top = layout.offsetY + paper.y * layout.scale;
  const width = paper.width * layout.scale;
  const height = paper.height * layout.scale;
  const actionHeight = Math.max(42, Math.min(48, height * 0.1));
  const actionBottomInset = Math.max(14, height * 0.045);
  const actionTop = top + height - actionHeight - actionBottomInset;

  gsap.set(portfolioCard, {
    position: "fixed",
    left,
    top,
    width,
    height,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    transformOrigin: "center",
  });
  gsap.set(paperGhostMask, {
    left: left - 3,
    top: top - 3,
    width: width + 6,
    height: height + 6,
  });
  gsap.set(introOpen, {
    left: left + width / 2,
    top: actionTop,
    width: Math.max(112, Math.min(178, width - 32)),
    minHeight: actionHeight,
  });
}

function playIntroEntrance() {
  introEntranceTimeline?.kill();
  const durationScale = prefersReducedMotion ? 0.05 : 1;
  introOpen.disabled = true;
  portfolioCard.classList.add("is-offered");
  introScene.style.setProperty("--scene-x", "0");
  introScene.style.setProperty("--scene-y", "0");

  gsap.set(introScene, { autoAlpha: 0 });
  gsap.set(introCharacter, { autoAlpha: 0, y: 4, scale: 1.002 });
  gsap.set(portfolioCard, { autoAlpha: 0, y: 3, scale: 0.97 });
  gsap.set(introOpen, { autoAlpha: 0, y: 5 });

  introEntranceTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });
  introEntranceTimeline
    .to(introScene, { autoAlpha: 1, duration: 0.34 * durationScale }, 0)
    .to(
      introCharacter,
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.38 * durationScale },
      0.1 * durationScale,
    )
    .to(portfolioCard, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 * durationScale }, 0.27 * durationScale)
    .to(introOpen, { autoAlpha: 1, y: 0, duration: 0.3 * durationScale }, 0.4 * durationScale)
    .call(() => {
      introOpen.disabled = false;
    });
}

function readIntroSeen() {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "seen";
  } catch {
    return false;
  }
}

function writeIntroSeen() {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "seen");
  } catch {
    // The intro still works when storage is unavailable.
  }
}

function hideIntroCursor() {
  introCursor?.classList.remove("is-visible");
}

function finishIntro() {
  writeIntroSeen();
  portfolioIntro.hidden = true;
  introHero?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("intro-active", "intro-pending");
  document.body.classList.add("intro-complete");
  introPlaying = false;
  hideIntroCursor();
}

function resetIntro() {
  introTimeline?.kill();
  introEntranceTimeline?.kill();
  introPlaying = false;
  window.scrollTo({ top: 0, behavior: "auto" });
  portfolioIntro.hidden = false;
  document.body.classList.remove("intro-complete");
  document.body.classList.add("intro-active", "on-light-hero");
  introOpen.disabled = false;
  introSkip.disabled = false;
  introHero?.setAttribute("aria-hidden", "true");
  portfolioName.classList.remove("is-hero-name");
  portfolioEdition.textContent = "PORTFOLIO";
  portfolioSelected.textContent = "SELECTED WORK";
  portfolioYears.textContent = "2015 — 2026";
  portfolioTags.innerHTML = "AI / PRODUCT /<br>EXPERIENCE DESIGN";
  introCursor.textContent = "OPEN";
  introCursor.classList.remove("is-viewing", "is-visible");
  gsap.set(
    [
      portfolioIntro,
      introScene,
      portfolioCard,
      introOpen,
      introCharacter,
      paperGhostMask,
      introCursor,
      introHero,
      portfolioName,
      portfolioEdition,
      portfolioSelected,
      portfolioYears,
      portfolioTags,
      ...coverDetails,
    ],
    { clearProps: "all" },
  );
  portfolioCard.classList.remove("is-offered");
  requestAnimationFrame(() => {
    alignIntroLayers();
    playIntroEntrance();
  });
}

function playIntro({ skip = false } = {}) {
  if (introPlaying || portfolioIntro.hidden) return;
  if (introEntranceTimeline?.isActive()) introEntranceTimeline.progress(1);
  introPlaying = true;
  introOpen.disabled = true;
  introSkip.disabled = true;

  const rect = portfolioCard.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const durationScale = prefersReducedMotion ? 0.06 : skip ? 0.23 : isMobile ? 0.62 : 1;
  const at = (seconds) => seconds * durationScale;
  const centerWidth = Math.min(isMobile ? 218 : 320, viewportWidth * 0.76);
  const centerHeight = centerWidth * 1.40625;
  const centerLeft = (viewportWidth - centerWidth) / 2;
  const centerTop = (viewportHeight - centerHeight) / 2;
  const heroIdentityRect = heroIdentity.getBoundingClientRect();
  const heroRoleRect = heroRole.getBoundingClientRect();
  const heroYearsRect = heroYears.getBoundingClientRect();
  const heroTitleRect = heroTitle.getBoundingClientRect();
  const heroCtaRect = heroCta.getBoundingClientRect();

  portfolioCard.classList.remove("is-offered");
  introHero?.setAttribute("aria-hidden", "false");
  introCursor.textContent = "VIEW";
  introCursor.classList.add("is-viewing");
  gsap.set(portfolioCard, {
    position: "fixed",
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    aspectRatio: "auto",
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    transformOrigin: "center",
  });
  gsap.set(introHero, {
    top: heroTitleRect.top,
    left: heroTitleRect.left,
    width: heroTitleRect.width,
    y: 18,
    autoAlpha: 0,
  });

  introTimeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });
  introTimeline
    .to(portfolioCard, { scale: 0.98, duration: at(0.06), ease: "power2.out" }, 0)
    .to(portfolioCard, { scale: 1.02, duration: at(0.06), ease: "power2.inOut" }, at(0.06))
    .to(introCursor, { autoAlpha: 0, duration: at(0.1), ease: "power1.out" }, at(0.1))
    .to(introOpen, { autoAlpha: 0, duration: at(0.14), ease: "power1.out" }, 0)
    .to(
      portfolioCard,
      {
        backgroundColor: "#fffdf7",
        borderColor: "rgba(24, 25, 25, 0.12)",
        boxShadow: "0 24px 55px rgba(55, 49, 37, 0.17), 0 5px 14px rgba(55, 49, 37, 0.09)",
        duration: at(0.12),
        ease: "power1.out",
      },
      0,
    )
    .to(introScene, { autoAlpha: 0, duration: at(0.45), ease: "power2.inOut" }, at(0.12))
    .to(paperGhostMask, { autoAlpha: 1, duration: at(0.14), ease: "power1.out" }, at(0.1))
    .to(
      portfolioCard,
      {
        left: centerLeft,
        top: centerTop,
        width: centerWidth,
        height: centerHeight,
        scale: 1,
        rotation: 0,
        duration: at(0.33),
      },
      at(0.12),
    )
    .to(
      introCharacter,
      { x: isMobile ? -12 : -20, scale: 0.97, autoAlpha: 0.65, duration: at(0.33) },
      at(0.12),
    )
    .to(portfolioCard, { left: 0, width: viewportWidth, duration: at(0.74) }, at(0.58))
    .to(portfolioCard, { top: 0, height: viewportHeight, duration: at(0.68) }, at(0.66))
    .to(
      portfolioCard,
      { borderRadius: 0, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: at(0.62) },
      at(0.66),
    )
    .to(introCharacter, { x: isMobile ? -18 : -32, scale: 0.95, autoAlpha: 0, duration: at(0.42) }, at(0.58))
    .to(paperGhostMask, { autoAlpha: 0, duration: at(0.36) }, at(0.58))
    .to([portfolioEdition, ...coverDetails], { autoAlpha: 0, duration: at(0.24) }, at(0.78))
    .call(
      () => {
        portfolioName.classList.add("is-hero-name");
        portfolioTags.textContent = "AI PRODUCT EXPERIENCE DESIGNER";
        portfolioYears.textContent = "11 YEARS EXPERIENCE";
      },
      [],
      at(1.04),
    )
    .to(
      portfolioName,
      {
        top: heroIdentityRect.top,
        left: heroIdentityRect.left,
        fontSize: parseFloat(getComputedStyle(heroIdentity).fontSize),
        lineHeight: getComputedStyle(heroIdentity).lineHeight,
        letterSpacing: "0.11em",
        duration: at(0.3),
      },
      at(1.04),
    )
    .to(
      portfolioTags,
      {
        top: heroRoleRect.top,
        left: heroRoleRect.left,
        right: "auto",
        bottom: "auto",
        width: heroRoleRect.width,
        padding: getComputedStyle(heroRole).padding,
        border: getComputedStyle(heroRole).border,
        color: getComputedStyle(heroRole).color,
        fontSize: parseFloat(getComputedStyle(heroRole).fontSize),
        duration: at(0.3),
      },
      at(1.04),
    )
    .to(
      portfolioYears,
      {
        top: heroYearsRect.top,
        left: heroYearsRect.left,
        color: getComputedStyle(heroYears).color,
        fontSize: parseFloat(getComputedStyle(heroYears).fontSize),
        duration: at(0.3),
      },
      at(1.04),
    )
    .to(
      portfolioSelected,
      {
        top: heroCtaRect.top,
        left: heroCtaRect.left,
        width: heroCtaRect.width,
        height: heroCtaRect.height,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        background: getComputedStyle(heroCta).backgroundColor,
        color: getComputedStyle(heroCta).color,
        fontSize: parseFloat(getComputedStyle(heroCta).fontSize),
        duration: at(0.3),
      },
      at(1.04),
    )
    .to(introHero, { y: 0, autoAlpha: 1, duration: at(0.32), ease: "power2.out" }, at(1.08))
    .to(portfolioIntro, { autoAlpha: 0, duration: at(0.16), ease: "power1.out" }, at(1.46))
    .call(finishIntro, [], at(1.64));
}

const forceIntro = new URLSearchParams(window.location.search).has("intro");
const shouldShowIntro = forceIntro || !readIntroSeen();
if (shouldShowIntro) {
  document.body.classList.remove("intro-pending");
  document.body.classList.add("intro-active");
  requestAnimationFrame(() => {
    alignIntroLayers();
    playIntroEntrance();
  });
} else {
  portfolioIntro.hidden = true;
  document.body.classList.remove("intro-pending");
  document.body.classList.add("intro-complete");
}

introOpen?.addEventListener("click", () => playIntro());
introSkip?.addEventListener("click", () => playIntro({ skip: true }));
replayIntro?.addEventListener("click", resetIntro);
window.addEventListener("pointermove", (event) => {
  if (!introCursor) return;
  introCursor.style.transform = `translate3d(${event.clientX - 29}px, ${event.clientY - 29}px, 0)`;
  if (portfolioIntro.hidden || introPlaying || isMobile) return;
  const sceneX = (event.clientX / window.innerWidth) * 2 - 1;
  const sceneY = (event.clientY / window.innerHeight) * 2 - 1;
  introScene.style.setProperty("--scene-x", sceneX.toFixed(3));
  introScene.style.setProperty("--scene-y", sceneY.toFixed(3));
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !portfolioIntro.hidden) playIntro({ skip: true });
});
window.addEventListener("resize", alignIntroLayers);

document.querySelector("[data-scroll-to-works]")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#works")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -7%" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const siteHeader = document.querySelector(".site-header");
function updateHeaderState() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();
requestAnimationFrame(() => document.body.classList.add("is-ready"));

// The previous WebGL world remains below for reference but is intentionally disabled.
// The current portfolio uses a lighter, card-based reading experience.
if (false) {

const stage = document.querySelector("#webgl-stage");
const chapters = [...document.querySelectorAll(".story-chapter")];
const chapterIndex = document.querySelector(".rail-index");
const chapterProgress = document.querySelector(".rail-line i");
const soundToggle = document.querySelector(".sound-toggle");
const characterLayer = document.querySelector(".character-layer");

const palette = {
  night: 0x090a0d,
  ink: 0xf4f1e8,
  blue: 0x3d79ff,
  deepBlue: 0x143b91,
  yellow: 0xffd43b,
  coral: 0xff6b5f,
  mint: 0x51d9b0,
  skin: 0xffc8b8,
  hair: 0x102d71,
  steel: 0x7f8aa3,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.night);
scene.fog = new THREE.FogExp2(palette.night, isMobile ? 0.046 : 0.038);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 1.35, isMobile ? 12.5 : 10.4);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x8ba6ff, 0x16110d, 1.65));
const keyLight = new THREE.PointLight(palette.yellow, 38, 18, 1.8);
keyLight.position.set(3.8, 5.5, 4.5);
scene.add(keyLight);
const rimLight = new THREE.PointLight(palette.blue, 30, 20, 1.6);
rimLight.position.set(-4.5, 1.8, -2.5);
scene.add(rimLight);

const world = new THREE.Group();
scene.add(world);

const mat = (color, options = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.64,
    metalness: options.metalness ?? 0.04,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  });

const materials = {
  ink: mat(palette.ink),
  dark: mat(0x171a20),
  darkSoft: mat(0x252a34),
  blue: mat(palette.blue, { emissive: 0x0a2f7c, emissiveIntensity: 0.32 }),
  deepBlue: mat(palette.deepBlue),
  yellow: mat(palette.yellow, { emissive: 0x4d3600, emissiveIntensity: 0.18 }),
  coral: mat(palette.coral, { emissive: 0x4e0906, emissiveIntensity: 0.18 }),
  mint: mat(palette.mint, { emissive: 0x073a2b, emissiveIntensity: 0.24 }),
  steel: mat(palette.steel, { metalness: 0.45, roughness: 0.36 }),
  skin: mat(palette.skin),
  hair: mat(palette.hair, { roughness: 0.42 }),
  screen: mat(0x8fc3ff, { emissive: 0x2b78ff, emissiveIntensity: 2.2, transparent: true, opacity: 0.78 }),
  glass: mat(0x6ca4ff, { emissive: 0x245dca, emissiveIntensity: 0.7, transparent: true, opacity: 0.2, metalness: 0.35 }),
};

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.rotation.set(...rotation);
  return object;
}

function roundedBox(size, material, radius = 0.14) {
  return mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius), material);
}

function capsule(radius, length, material) {
  return mesh(new THREE.CapsuleGeometry(radius, length, 6, 14), material);
}

function addFloor(group, color = 0x12141a, width = 12) {
  const floor = mesh(new THREE.CircleGeometry(width / 2, 64), mat(color, { roughness: 0.82 }), [0, -2.42, -0.2], [-Math.PI / 2, 0, 0]);
  group.add(floor);
  const ring = mesh(new THREE.RingGeometry(width / 2 + 0.12, width / 2 + 0.16, 64), materials.glass, [0, -2.4, -0.2], [-Math.PI / 2, 0, 0]);
  group.add(ring);
}

function addLine(group, points, color, opacity = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  const line = new THREE.Line(geometry, material);
  group.add(line);
  return line;
}

function createGirl() {
  const girl = new THREE.Group();
  const body = new THREE.Group();
  girl.add(body);

  const torso = mesh(new THREE.CapsuleGeometry(0.43, 0.82, 8, 18), materials.yellow, [0, 0.55, 0]);
  torso.scale.set(1.1, 1, 0.75);
  body.add(torso);

  const belt = mesh(new THREE.TorusGeometry(0.46, 0.07, 8, 30), materials.coral, [0, 0.15, 0], [Math.PI / 2, 0, 0]);
  body.add(belt);

  const neck = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.28, 18), materials.skin, [0, 1.32, 0]);
  body.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.68, 32, 24), materials.skin, [0, 1.94, 0.03]);
  head.scale.set(1, 1.06, 0.88);
  body.add(head);

  const hairCap = mesh(new THREE.SphereGeometry(0.71, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), materials.hair, [0, 2.12, -0.06], [0, 0, 0]);
  hairCap.scale.set(1.03, 1.05, 0.95);
  body.add(hairCap);

  const bunGeometry = new THREE.SphereGeometry(0.34, 20, 16);
  const bunLeft = mesh(bunGeometry, materials.hair, [-0.54, 2.55, -0.06]);
  const bunRight = mesh(bunGeometry, materials.hair, [0.54, 2.55, -0.06]);
  bunLeft.scale.set(1.1, 0.9, 1);
  bunRight.scale.copy(bunLeft.scale);
  body.add(bunLeft, bunRight);

  const clipLeft = mesh(new THREE.SphereGeometry(0.09, 16, 12), materials.coral, [-0.66, 2.62, 0.18]);
  const clipRight = mesh(new THREE.SphereGeometry(0.08, 16, 12), materials.yellow, [0.6, 2.72, 0.1]);
  body.add(clipLeft, clipRight);

  const eyeGeometry = new THREE.SphereGeometry(0.16, 20, 14);
  const eyeLeft = mesh(eyeGeometry, materials.ink, [-0.24, 2.02, 0.57]);
  const eyeRight = mesh(eyeGeometry, materials.ink, [0.24, 2.02, 0.57]);
  eyeLeft.scale.set(1, 1.18, 0.28);
  eyeRight.scale.copy(eyeLeft.scale);
  body.add(eyeLeft, eyeRight);

  const pupilGeometry = new THREE.SphereGeometry(0.073, 16, 12);
  const pupilMaterial = mat(0x12141b, { roughness: 0.2 });
  const pupilLeft = mesh(pupilGeometry, pupilMaterial, [-0.24, 2.02, 0.705]);
  const pupilRight = mesh(pupilGeometry, pupilMaterial, [0.24, 2.02, 0.705]);
  pupilLeft.scale.set(1, 1.18, 0.28);
  pupilRight.scale.copy(pupilLeft.scale);
  body.add(pupilLeft, pupilRight);

  const blushLeft = mesh(new THREE.SphereGeometry(0.12, 16, 10), materials.coral, [-0.4, 1.82, 0.56]);
  const blushRight = mesh(new THREE.SphereGeometry(0.12, 16, 10), materials.coral, [0.4, 1.82, 0.56]);
  blushLeft.scale.set(1.4, 0.45, 0.18);
  blushRight.scale.copy(blushLeft.scale);
  body.add(blushLeft, blushRight);

  const mouth = mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 18, Math.PI), materials.coral, [0, 1.76, 0.62], [0, 0, Math.PI]);
  body.add(mouth);

  const leftArm = capsule(0.14, 0.82, materials.skin);
  leftArm.position.set(-0.62, 0.66, 0);
  leftArm.rotation.z = -0.42;
  const rightArm = capsule(0.14, 0.82, materials.skin);
  rightArm.position.set(0.63, 0.82, 0.02);
  rightArm.rotation.z = 0.84;
  body.add(leftArm, rightArm);

  const leftLeg = capsule(0.19, 0.8, materials.deepBlue);
  leftLeg.position.set(-0.28, -0.55, 0);
  const rightLeg = capsule(0.19, 0.8, materials.deepBlue);
  rightLeg.position.set(0.28, -0.55, 0);
  body.add(leftLeg, rightLeg);

  const shoeLeft = roundedBox([0.4, 0.24, 0.65], materials.ink, 0.1);
  shoeLeft.position.set(-0.28, -1.2, 0.18);
  const shoeRight = roundedBox([0.4, 0.24, 0.65], materials.ink, 0.1);
  shoeRight.position.set(0.28, -1.2, 0.18);
  body.add(shoeLeft, shoeRight);

  girl.userData = { body, head, pupilLeft, pupilRight, bunLeft, bunRight, leftArm, rightArm };
  return girl;
}

function createRobot() {
  const robot = new THREE.Group();
  const body = roundedBox([0.72, 0.66, 0.6], materials.ink, 0.18);
  body.position.y = 0.18;
  const face = roundedBox([0.58, 0.36, 0.08], materials.dark, 0.12);
  face.position.set(0, 0.3, 0.32);
  const eyeGeometry = new THREE.SphereGeometry(0.065, 14, 10);
  const eyeLeft = mesh(eyeGeometry, materials.screen, [-0.16, 0.32, 0.39]);
  const eyeRight = mesh(eyeGeometry, materials.screen, [0.16, 0.32, 0.39]);
  const antenna = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 10), materials.steel, [0, 0.84, 0]);
  const antennaTip = mesh(new THREE.SphereGeometry(0.09, 14, 10), materials.yellow, [0, 1.04, 0]);
  const wheel = mesh(new THREE.TorusGeometry(0.22, 0.08, 10, 24), materials.blue, [0, -0.28, 0], [0, Math.PI / 2, 0]);
  robot.add(body, face, eyeLeft, eyeRight, antenna, antennaTip, wheel);
  robot.userData = { body, eyeLeft, eyeRight, antennaTip };
  return robot;
}

function createStudio(centerX) {
  const group = new THREE.Group();
  group.position.x = centerX;
  addFloor(group, 0x111318, 12);

  const deskTop = roundedBox([5.4, 0.24, 2.1], materials.darkSoft, 0.12);
  deskTop.position.set(2.15, -0.55, -0.72);
  group.add(deskTop);
  [-1, 1].forEach((side) => {
    const leg = roundedBox([0.22, 1.7, 0.22], materials.darkSoft, 0.06);
    leg.position.set(2.15 + side * 2.1, -1.4, -0.72);
    group.add(leg);
  });

  const monitor = roundedBox([2.15, 1.25, 0.12], materials.dark, 0.16);
  monitor.position.set(1.45, 0.36, -0.72);
  monitor.rotation.y = -0.1;
  const screen = roundedBox([1.9, 1.02, 0.03], materials.screen, 0.1);
  screen.position.set(1.45, 0.36, -0.65);
  screen.rotation.y = -0.1;
  group.add(monitor, screen);

  const lampBase = mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.14, 24), materials.blue, [4.1, -0.34, -0.5]);
  const lampStem = mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.45, 12), materials.blue, [4.1, 0.4, -0.5], [0, 0, -0.25]);
  const lampShade = mesh(new THREE.ConeGeometry(0.46, 0.6, 24, 1, true), materials.yellow, [3.92, 1.1, -0.42], [0, 0, Math.PI]);
  group.add(lampBase, lampStem, lampShade);

  for (let index = 0; index < 8; index += 1) {
    const paper = roundedBox([0.55 + (index % 2) * 0.18, 0.025, 0.38], index % 3 === 0 ? materials.yellow : materials.ink, 0.02);
    paper.position.set(0.45 + index * 0.48, -0.38 + (index % 2) * 0.03, 0.4 + (index % 3) * 0.17);
    paper.rotation.y = (index - 3) * 0.12;
    group.add(paper);
  }

  return group;
}

function createAiLab(centerX) {
  const group = new THREE.Group();
  group.position.x = centerX;
  addFloor(group, 0x0b1222, 12.5);

  const core = mesh(new THREE.IcosahedronGeometry(0.72, 2), materials.screen, [2.6, 0.5, -0.2]);
  core.userData.baseScale = 1;
  group.add(core);

  for (let index = 0; index < 3; index += 1) {
    const ring = mesh(new THREE.TorusGeometry(1.25 + index * 0.4, 0.035, 8, 64), index === 1 ? materials.yellow : materials.blue, [2.6, 0.5, -0.2], [Math.PI / 2 + index * 0.45, index * 0.5, 0]);
    group.add(ring);
    gsap.to(ring.rotation, { z: Math.PI * 2 * (index % 2 ? -1 : 1), duration: 8 + index * 2, repeat: -1, ease: "none" });
  }

  const panelPositions = [
    [0.2, 1.5, -0.8],
    [4.75, 1.8, -0.9],
    [0.8, -0.4, 0.3],
    [4.65, -0.15, 0.1],
  ];
  panelPositions.forEach((position, index) => {
    const panel = roundedBox([1.55, 0.9, 0.08], index % 2 ? materials.glass : materials.screen, 0.12);
    panel.position.set(...position);
    panel.rotation.y = index < 2 ? (index ? -0.22 : 0.22) : 0;
    group.add(panel);
    for (let lineIndex = 0; lineIndex < 3; lineIndex += 1) {
      const line = roundedBox([0.85 - lineIndex * 0.12, 0.035, 0.015], lineIndex === 0 ? materials.yellow : materials.ink, 0.01);
      line.position.set(position[0], position[1] + 0.2 - lineIndex * 0.18, position[2] + 0.07);
      line.rotation.y = panel.rotation.y;
      group.add(line);
    }
  });

  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * Math.PI * 2;
    const radius = 2.2 + (index % 3) * 0.35;
    const node = mesh(new THREE.SphereGeometry(0.055 + (index % 2) * 0.025, 12, 8), index % 4 === 0 ? materials.yellow : materials.blue, [2.6 + Math.cos(angle) * radius, 0.5 + Math.sin(angle * 2) * 0.7, -0.5 + Math.sin(angle) * radius * 0.22]);
    group.add(node);
  }

  return { group, core };
}

function createSystemCity(centerX) {
  const group = new THREE.Group();
  group.position.x = centerX;
  addFloor(group, 0x0b1020, 12.5);

  const base = mesh(new THREE.CylinderGeometry(4.7, 5.1, 0.45, 6), materials.darkSoft, [0, -2.05, -0.1]);
  group.add(base);

  const positions = [
    [-3.2, -1.15, -0.6, 0.9, 1.6],
    [-2, -0.65, -0.2, 1.1, 2.5],
    [-0.7, -1.05, 0.35, 0.8, 1.7],
    [0.6, -0.35, -0.45, 1.3, 3.1],
    [2, -1, 0.4, 0.95, 1.8],
    [3.25, -0.7, -0.2, 0.75, 2.45],
  ];

  positions.forEach(([x, y, z, width, height], index) => {
    const building = roundedBox([width, height, width * 0.8], index % 3 === 0 ? materials.blue : materials.darkSoft, 0.1);
    building.position.set(x, y, z);
    group.add(building);
    const roof = mesh(new THREE.SphereGeometry(0.12, 12, 8), index % 2 ? materials.yellow : materials.screen, [x, y + height / 2 + 0.18, z]);
    group.add(roof);
  });

  const linePoints = positions.map(([x, , z]) => [x, -1.88, z + 0.55]);
  addLine(group, linePoints, palette.blue, 0.85);
  positions.forEach(([x, y, z], index) => {
    if (index < positions.length - 1) {
      const next = positions[index + 1];
      addLine(group, [[x, y + 0.6, z], [next[0], next[1] + 0.6, next[2]]], index % 2 ? palette.yellow : palette.blue, 0.5);
    }
  });

  return group;
}

function createConsumerPlanet(centerX) {
  const group = new THREE.Group();
  group.position.x = centerX;

  const planet = mesh(new THREE.SphereGeometry(2.25, 40, 28), materials.coral, [2.15, -0.1, -0.25]);
  planet.scale.y = 0.82;
  group.add(planet);
  const ring = mesh(new THREE.TorusGeometry(3.35, 0.09, 10, 90), materials.yellow, [2.15, -0.1, -0.25], [1.25, 0.15, 0.18]);
  group.add(ring);

  const phone = roundedBox([2.35, 4.2, 0.34], materials.dark, 0.38);
  phone.position.set(2.2, 0.2, 1.05);
  phone.rotation.z = -0.18;
  const phoneScreen = roundedBox([2.05, 3.82, 0.05], materials.screen, 0.28);
  phoneScreen.position.set(2.2, 0.2, 1.25);
  phoneScreen.rotation.z = -0.18;
  group.add(phone, phoneScreen);

  for (let index = 0; index < 14; index += 1) {
    const angle = (index / 14) * Math.PI * 2;
    const radius = 3.5 + (index % 2) * 0.45;
    const bubble = mesh(new THREE.SphereGeometry(0.13 + (index % 3) * 0.05, 14, 10), [materials.yellow, materials.mint, materials.coral, materials.blue][index % 4], [2.15 + Math.cos(angle) * radius, -0.1 + Math.sin(angle) * 1.65, -0.1 + Math.sin(angle * 2) * 0.5]);
    group.add(bubble);
    gsap.to(bubble.position, { y: bubble.position.y + 0.22, duration: 1.4 + (index % 4) * 0.25, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  return { group, planet, phone };
}

function createContactStudio(centerX) {
  const group = new THREE.Group();
  group.position.x = centerX;
  addFloor(group, 0x17120f, 13);

  const sofaSeat = roundedBox([5.4, 1.05, 2.2], materials.deepBlue, 0.42);
  sofaSeat.position.set(0.8, -1.55, -0.65);
  const sofaBack = roundedBox([5.4, 2.15, 0.72], materials.blue, 0.42);
  sofaBack.position.set(0.8, -0.55, -1.45);
  const armLeft = roundedBox([0.72, 1.55, 2.2], materials.blue, 0.32);
  armLeft.position.set(-2.1, -1.2, -0.65);
  const armRight = roundedBox([0.72, 1.55, 2.2], materials.blue, 0.32);
  armRight.position.set(3.7, -1.2, -0.65);
  group.add(sofaSeat, sofaBack, armLeft, armRight);

  const phone = roundedBox([4.15, 2.25, 0.28], materials.dark, 0.32);
  phone.position.set(0.6, -0.15, 1.15);
  phone.rotation.z = -0.08;
  const screen = roundedBox([3.75, 1.85, 0.05], materials.ink, 0.24);
  screen.position.set(0.6, -0.15, 1.33);
  screen.rotation.z = -0.08;
  group.add(phone, screen);

  const contactDots = [materials.blue, materials.yellow, materials.coral];
  contactDots.forEach((material, index) => {
    const dot = mesh(new THREE.SphereGeometry(0.11, 14, 10), material, [-0.7 + index * 0.7, -0.15, 1.43]);
    group.add(dot);
  });

  return { group, phone };
}

function createStars() {
  const count = isMobile ? 180 : 420;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = Math.random() * 90 - 8;
    positions[index * 3 + 1] = Math.random() * 16 - 7;
    positions[index * 3 + 2] = Math.random() * 22 - 14;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: palette.ink, size: 0.035, transparent: true, opacity: 0.42 });
  world.add(new THREE.Points(geometry, material));
}

const studio = createStudio(0);
const aiLab = createAiLab(18);
const city = createSystemCity(36);
const consumer = createConsumerPlanet(54);
const contact = createContactStudio(72);
world.add(studio, aiLab.group, city, consumer.group, contact.group);
createStars();

const girl = createGirl();
girl.position.set(2.9, -0.95, 0.45);
girl.rotation.y = -0.16;
girl.visible = false;
world.add(girl);

const robot = createRobot();
robot.position.set(0.25, -1.63, 0.75);
robot.rotation.y = 0.2;
world.add(robot);

const pointer = new THREE.Vector2();
const smoothPointer = new THREE.Vector2();
let scrollProgress = 0;
let activeChapter = 0;

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  document.documentElement.style.setProperty("--avatar-x", (pointer.x * 7).toFixed(2));
  document.documentElement.style.setProperty("--avatar-y", (-pointer.y * 4).toFixed(2));
  document.documentElement.style.setProperty("--avatar-tilt", (pointer.x * 0.45).toFixed(2));
});

renderer.domElement.addEventListener("click", () => {
  if (activeChapter !== 0) return;
  gsap.fromTo(robot.rotation, { y: robot.rotation.y }, { y: robot.rotation.y + Math.PI * 2, duration: 0.65, ease: "back.out(1.8)" });
  gsap.fromTo(robot.userData.antennaTip.scale, { x: 1, y: 1, z: 1 }, { x: 1.8, y: 1.8, z: 1.8, duration: 0.2, yoyo: true, repeat: 1 });
});

const timeline = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: "#story",
    start: "top top",
    end: "bottom bottom",
    scrub: prefersReducedMotion ? false : 0.85,
    onUpdate(self) {
      scrollProgress = self.progress;
      activeChapter = Math.min(4, Math.floor(self.progress * 5));
      chapterIndex.textContent = String(activeChapter + 1).padStart(2, "0");
      chapterProgress.style.transform = `scaleY(${0.2 + self.progress * 0.8})`;
      document.body.classList.toggle("on-light-hero", activeChapter === 0);
    },
  },
});

timeline
  .to(camera.position, { x: 18, duration: 1 }, 0)
  .to(characterLayer, { xPercent: 2, yPercent: -3, rotation: 1, duration: 1 }, 0)
  .to(girl.position, { x: 20.75, y: -0.55, duration: 1 }, 0)
  .to(girl.rotation, { y: 0.18, z: 0.04, duration: 1 }, 0)
  .to(robot.position, { x: 17.25, y: -1.2, z: 1.2, duration: 1 }, 0)
  .to(robot.rotation, { y: Math.PI * 2.2, duration: 1 }, 0)
  .to(keyLight.position, { x: 21, duration: 1 }, 0)
  .to(rimLight.position, { x: 14, duration: 1 }, 0)
  .to(camera.position, { x: 36, y: 1.6, duration: 1 }, 1)
  .to(characterLayer, { xPercent: isMobile ? -20 : -90, yPercent: 2, rotation: -1.5, duration: 1 }, 1)
  .to(girl.position, { x: 33.25, y: -0.8, duration: 1 }, 1)
  .to(girl.rotation, { y: -0.45, z: -0.08, duration: 1 }, 1)
  .to(robot.position, { x: 36.4, y: -0.85, z: 1, duration: 1 }, 1)
  .to(keyLight.position, { x: 33, duration: 1 }, 1)
  .to(rimLight.position, { x: 39, duration: 1 }, 1)
  .to(camera.position, { x: 54, y: 1.35, duration: 1 }, 2)
  .to(characterLayer, { xPercent: 0, yPercent: -4, rotation: 1.2, duration: 1 }, 2)
  .to(girl.position, { x: 56.9, y: 1.15, z: 1.25, duration: 1 }, 2)
  .to(girl.rotation, { y: -0.08, z: -0.18, duration: 1 }, 2)
  .to(robot.position, { x: 52.1, y: -0.1, z: 1.2, duration: 1 }, 2)
  .to(keyLight.position, { x: 57, duration: 1 }, 2)
  .to(rimLight.position, { x: 50, duration: 1 }, 2)
  .to(camera.position, { x: 72, y: 1.5, duration: 1 }, 3)
  .to(characterLayer, { xPercent: -32, yPercent: 4, rotation: 0, opacity: 0, duration: 1 }, 3)
  .to(girl.position, { x: 75.2, y: -0.55, z: 0.8, duration: 1 }, 3)
  .to(girl.rotation, { y: -0.25, z: 0, duration: 1 }, 3)
  .to(robot.position, { x: 69.4, y: -1.2, z: 1, duration: 1 }, 3)
  .to(keyLight.position, { x: 75, duration: 1 }, 3)
  .to(rimLight.position, { x: 69, duration: 1 }, 3);

chapters.forEach((chapter, index) => {
  const copy = chapter.querySelector(".chapter-copy");
  if (!copy || index === 0) return;
  gsap.fromTo(
    copy,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: chapter,
        start: "top 70%",
        end: "top 35%",
        scrub: prefersReducedMotion ? false : 0.5,
      },
    },
  );
});

document.querySelector("[data-scroll-to-works]")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#works")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
});

let audioContext;
let ambienceGain;
soundToggle?.addEventListener("click", async () => {
  const willPlay = soundToggle.getAttribute("aria-pressed") !== "true";
  soundToggle.setAttribute("aria-pressed", String(willPlay));
  soundToggle.setAttribute("aria-label", willPlay ? "关闭环境音" : "开启环境音");

  if (!audioContext) {
    audioContext = new AudioContext();
    ambienceGain = audioContext.createGain();
    ambienceGain.gain.value = 0;
    ambienceGain.connect(audioContext.destination);
    [58, 87, 116].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.02 : 0.006;
      oscillator.connect(gain).connect(ambienceGain);
      oscillator.start();
    });
  }

  await audioContext.resume();
  ambienceGain.gain.cancelScheduledValues(audioContext.currentTime);
  ambienceGain.gain.linearRampToValueAtTime(willPlay ? 0.55 : 0, audioContext.currentTime + 0.35);
});

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = window.innerWidth <= 720 ? 12.5 : 10.4;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 720 ? 1.25 : 1.65));
}

window.addEventListener("resize", resize);

const timer = new THREE.Timer();
function render() {
  timer.update();
  const elapsed = timer.getElapsed();
  smoothPointer.lerp(pointer, 0.075);

  girl.userData.pupilLeft.position.x = -0.24 + smoothPointer.x * 0.035;
  girl.userData.pupilRight.position.x = 0.24 + smoothPointer.x * 0.035;
  girl.userData.pupilLeft.position.y = 2.02 + smoothPointer.y * 0.025;
  girl.userData.pupilRight.position.y = 2.02 + smoothPointer.y * 0.025;
  girl.userData.head.rotation.y = smoothPointer.x * 0.1;
  girl.userData.head.rotation.x = -smoothPointer.y * 0.06;
  girl.userData.bunLeft.rotation.z = Math.sin(elapsed * 1.8) * 0.08;
  girl.userData.bunRight.rotation.z = -Math.sin(elapsed * 1.8) * 0.08;
  girl.userData.body.position.y = Math.sin(elapsed * 1.6) * 0.015;
  robot.userData.body.position.y = 0.18 + Math.sin(elapsed * 2.1) * 0.035;
  robot.userData.antennaTip.material.emissiveIntensity = 0.25 + Math.sin(elapsed * 3.5) * 0.12;
  aiLab.core.rotation.y = elapsed * 0.45;
  aiLab.core.rotation.x = elapsed * 0.22;
  consumer.planet.rotation.y = elapsed * 0.08;

  const mobileFocusOffsets = [1.9, 2.15, -1.8, 2.1, 0.65];
  const mobilePhase = Math.min(4, scrollProgress * 4);
  const mobilePhaseIndex = Math.floor(mobilePhase);
  const nextMobilePhaseIndex = Math.min(4, mobilePhaseIndex + 1);
  const mobilePhaseMix = mobilePhase - mobilePhaseIndex;
  const mobileFocusX = THREE.MathUtils.lerp(
    mobileFocusOffsets[mobilePhaseIndex],
    mobileFocusOffsets[nextMobilePhaseIndex],
    mobilePhaseMix,
  );
  const cameraOffsetX = isMobile ? mobileFocusX : smoothPointer.x * 0.16;
  const cameraOffsetY = isMobile ? 2 : smoothPointer.y * 0.12;
  camera.lookAt(camera.position.x + cameraOffsetX, 0.35 + cameraOffsetY, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
requestAnimationFrame(() => document.body.classList.add("is-ready"));
}
