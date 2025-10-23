export interface Profile {
  name: string;
  title: string;
  email: string;
  github: string;
  githubUsername: string;
  avatar: string;
  description: string;
  linkedin?: string;
}

export const profile: Profile = {
  name: "Guilherme Carvalho",
  title: "Desenvolvedor Full-Stack",
  email: "30010987@students.ual.pt",
  github: "https://github.com/git2026",
  githubUsername: "git2026",
  avatar: "/assets/profile.svg", // Fallback
  description: "Desenvolvedor full-stack com experiência em aplicações web completas, desde websites desenvolvidos com PHP e MySQL até sistemas de streaming baseados em microserviços com load balancing, entre outros."
};
