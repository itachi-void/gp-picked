const baseFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const fadeInUp = (delay = 0, distance = 20) => ({
  ...baseFade,
  initial: { ...baseFade.initial, y: distance },
  animate: { ...baseFade.animate, y: 0 },
  transition: { duration: 0.6, delay },
});

export const scaleIn = (delay = 0, scale = 0.8) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, delay },
});

export const hoverLiftShadow = {
  whileHover: {
    y: -10,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { duration: 0.3 },
  },
};

export const spinForever = (duration = 20) => ({
  animate: { rotate: 360 },
  transition: {
    duration,
    repeat: Infinity,
    ease: "linear",
  },
});

export const inViewDefault = {
  once: true,
  margin: "-50px",
};