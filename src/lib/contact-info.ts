import { Mail, Phone, MapPin, Clock, Github, Linkedin, Twitter } from "lucide-react";

export const contactInfo = [
  { icon: Mail, title: "Email", value: "contato@softrha.com", href: "mailto:contato@softrha.com" },
  { icon: Phone, title: "Telefone", value: "+55 (27) 98872-2086", href: "tel:+5527988722086" },
  { icon: MapPin, title: "Localização", value: "Vila Velha, ES - Brasil", href: "https://www.google.com/maps/place/Vila+Velha,+ES/@-20.2666667,-40.2666667,13z/data=!4m5!3m4!1s0x71644c0b0b0b0b0b:0x0!8m2!3d-20.2666667!4d-40.2666667" },
  { icon: Clock, title: "Atendimento", value: "Seg-Sex: 9h às 18h", href: "https://wa.me/5527988722086" },
];

export const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com/softrha", ariaLabel: "GitHub" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/softrha", ariaLabel: "LinkedIn" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/softrha", ariaLabel: "Twitter" },
];

export const emailContact = {
  email: "contato@softrha.com",
  href: "mailto:contato@softrha.com",
  icon: Mail,
};
