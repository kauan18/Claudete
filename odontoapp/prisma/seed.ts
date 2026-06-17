import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Gera um slug ASCII-safe (sem acentos) para usar como ID estável. */
function slugify(text: string): string {
  // Decompõe (é -> e + acento) e descarta os diacríticos combinantes (U+0300–U+036F)
  let out = "";
  for (const ch of text.normalize("NFD")) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0300 && code <= 0x036f) continue;
    out += ch;
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Clínica fictícia ──────────────────────────────────────────────────────
  const clinic = await prisma.clinic.upsert({
    where: { slug: "sorriso-perfeito" },
    update: {},
    create: {
      slug: "sorriso-perfeito",
      name: "Clínica Sorriso Perfeito",
      description:
        "Cuidamos do seu sorriso com tecnologia de ponta e carinho. Especialistas em estética dental, implantes e ortodontia.",
      address: "Av. Paulista, 1234 – Sala 56, Bela Vista, São Paulo – SP",
      phone: "(11) 3456-7890",
      whatsapp: "5511934567890",
      email: "contato@sorrisoperfeito.com.br",
      primaryColor: "#0ea5e9",
      secondaryColor: "#0369a1",
      instagram: "https://instagram.com/sorrisoperfeito",
      appointmentBuffer: 15,
      cancelMinHours: 24,
      businessHours: {
        mon: ["08:00", "18:00"],
        tue: ["08:00", "18:00"],
        wed: ["08:00", "18:00"],
        thu: ["08:00", "18:00"],
        fri: ["08:00", "17:00"],
        sat: ["09:00", "13:00"],
        sun: null,
      },
    },
  });

  console.log(`✅ Clínica criada: ${clinic.name} (/${clinic.slug})`);

  // ─── Usuários ──────────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "super@odontoapp.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super@odontoapp.com",
      password: await hash("SuperAdmin@123"),
      role: UserRole.super_admin,
    },
  });

  const adminClinica = await prisma.user.upsert({
    where: { email: "admin@sorrisoperfeito.com.br" },
    update: {},
    create: {
      name: "Dra. Ana Lima (Admin)",
      email: "admin@sorrisoperfeito.com.br",
      password: await hash("Admin@123"),
      role: UserRole.admin_clinica,
      clinicId: clinic.id,
    },
  });

  const recepcao = await prisma.user.upsert({
    where: { email: "recepcao@sorrisoperfeito.com.br" },
    update: {},
    create: {
      name: "Carla Recepção",
      email: "recepcao@sorrisoperfeito.com.br",
      password: await hash("Recepcao@123"),
      role: UserRole.recepcao,
      clinicId: clinic.id,
    },
  });

  console.log(`✅ Usuários criados: ${superAdmin.email}, ${adminClinica.email}, ${recepcao.email}`);

  // ─── Profissionais ─────────────────────────────────────────────────────────
  const dra1 = await prisma.professional.upsert({
    where: { id: "prof-ana-001" },
    update: {},
    create: {
      id: "prof-ana-001",
      clinicId: clinic.id,
      name: "Dra. Ana Lima",
      specialty: "Ortodontia e Estética Dental",
      bio: "Especialista em ortodontia com mais de 15 anos de experiência. Formada pela USP e pós-graduada em Estética Dental.",
      workingHours: {
        mon: ["08:00", "17:00"],
        tue: ["08:00", "17:00"],
        wed: ["08:00", "17:00"],
        thu: ["08:00", "17:00"],
        fri: ["08:00", "16:00"],
      },
    },
  });

  const dr2 = await prisma.professional.upsert({
    where: { id: "prof-carlos-002" },
    update: {},
    create: {
      id: "prof-carlos-002",
      clinicId: clinic.id,
      name: "Dr. Carlos Mendes",
      specialty: "Implantodontia e Cirurgia Oral",
      bio: "Cirurgião-dentista especializado em implantes. Membro da Sociedade Brasileira de Implantodontia.",
      workingHours: {
        tue: ["09:00", "18:00"],
        wed: ["09:00", "18:00"],
        thu: ["09:00", "18:00"],
        fri: ["09:00", "17:00"],
        sat: ["09:00", "13:00"],
      },
    },
  });

  console.log(`✅ Profissionais criados: ${dra1.name}, ${dr2.name}`);

  // ─── Serviços ──────────────────────────────────────────────────────────────
  const servicos = [
    {
      name: "Consulta de Avaliação",
      description: "Avaliação completa da saúde bucal com diagnóstico personalizado.",
      durationMin: 60,
      price: 150,
      category: "Preventivo",
    },
    {
      name: "Limpeza e Profilaxia",
      description: "Remoção de tártaro e polimento dental para manter a saúde das gengivas.",
      durationMin: 60,
      price: 200,
      category: "Preventivo",
    },
    {
      name: "Clareamento Dental",
      description: "Clareamento a laser com resultado imediato. Até 8 tons mais claro em uma sessão.",
      durationMin: 90,
      price: 800,
      category: "Estética",
    },
    {
      name: "Aparelho Ortodôntico",
      description: "Correção do alinhamento dos dentes com aparelho fixo ou invisível (Invisalign).",
      durationMin: 60,
      price: null,
      category: "Ortodontia",
    },
    {
      name: "Implante Dentário",
      description: "Substituição de dentes perdidos com implantes de titânio de alta durabilidade.",
      durationMin: 120,
      price: null,
      category: "Implantodontia",
    },
    {
      name: "Restauração Estética",
      description: "Restauração em resina composta de alta qualidade com resultado natural.",
      durationMin: 60,
      price: 350,
      category: "Estética",
    },
    {
      name: "Extração Simples",
      description: "Extração dentária simples com anestesia local.",
      durationMin: 45,
      price: 250,
      category: "Cirurgia",
    },
    {
      name: "Tratamento de Canal",
      description: "Endodontia com equipamento moderno e sem dor.",
      durationMin: 90,
      price: 600,
      category: "Endodontia",
    },
  ];

  for (const s of servicos) {
    await prisma.service.upsert({
      where: { id: `svc-${slugify(s.name)}` },
      update: {},
      create: {
        id: `svc-${slugify(s.name)}`,
        clinicId: clinic.id,
        ...s,
        price: s.price ? s.price : undefined,
      },
    });
  }

  console.log(`✅ ${servicos.length} serviços criados`);

  // ─── Base de Conhecimento ──────────────────────────────────────────────────
  const faq = [
    {
      question: "Quais são os horários de atendimento?",
      answer:
        "Atendemos de segunda a sexta das 8h às 18h, sexta até 17h e sábado das 9h às 13h. Domingos e feriados não temos atendimento.",
      category: "Funcionamento",
    },
    {
      question: "Vocês atendem convênio ou plano odontológico?",
      answer:
        "No momento atendemos apenas de forma particular. Oferecemos parcelamento em até 12x no cartão sem juros para tratamentos de maior valor.",
      category: "Pagamento",
    },
    {
      question: "Como faço para agendar uma consulta?",
      answer:
        "Você pode agendar diretamente pelo nosso site, clicando em 'Agendar Consulta'. Também pode entrar em contato pelo WhatsApp ou ligar para (11) 3456-7890.",
      category: "Agendamento",
    },
    {
      question: "O clareamento dental é doloroso?",
      answer:
        "O clareamento pode causar sensibilidade temporária durante e após o procedimento. Utilizamos gel dessensibilizante para minimizar o desconforto. A grande maioria dos pacientes não relata dor, apenas leve sensibilidade.",
      category: "Serviços",
    },
    {
      question: "Quantas sessões são necessárias para o clareamento?",
      answer:
        "O clareamento a laser é realizado em uma única sessão de aproximadamente 90 minutos. Em alguns casos, pode ser necessária uma segunda sessão para potencializar o resultado.",
      category: "Serviços",
    },
    {
      question: "Posso cancelar ou reagendar minha consulta?",
      answer:
        "Sim! Você pode cancelar ou reagendar com até 24 horas de antecedência sem nenhum custo, pelo link que enviamos por e-mail ou diretamente pelo WhatsApp.",
      category: "Agendamento",
    },
    {
      question: "Vocês atendem crianças?",
      answer:
        "Sim, atendemos pacientes de todas as idades. Para crianças menores de 12 anos, recomendamos a consulta de avaliação com a Dra. Ana Lima, que tem experiência em odontopediatria.",
      category: "Pacientes",
    },
    {
      question: "Onde a clínica está localizada?",
      answer:
        "Estamos na Av. Paulista, 1234 – Sala 56, Bela Vista, São Paulo. Próximo à estação Brigadeiro do Metrô. Há estacionamento no próprio edifício.",
      category: "Localização",
    },
  ];

  for (let i = 0; i < faq.length; i++) {
    const item = faq[i];
    await prisma.knowledgeBase.upsert({
      where: { id: `kb-${i + 1}` },
      update: {},
      create: {
        id: `kb-${i + 1}`,
        clinicId: clinic.id,
        ...item,
      },
    });
  }

  console.log(`✅ ${faq.length} itens de base de conhecimento criados`);

  // ─── Portfólio ─────────────────────────────────────────────────────────────
  const portfolio = [
    {
      title: "Clareamento Dental — Resultado Imediato",
      description: "Paciente com manchas por café. Resultado após sessão única de clareamento a laser.",
      category: "Clareamento",
    },
    {
      title: "Aparelho Invisível — Alinhamento Total",
      description: "Correção de sobremordida e dentes apinhados com Invisalign em 18 meses.",
      category: "Ortodontia",
    },
    {
      title: "Implante com Coroa Porcelana",
      description: "Substituição de molar perdido com implante de titânio e coroa em porcelana pura.",
      category: "Implante",
    },
    {
      title: "Restauração Estética em Resina",
      description: "Reconstrução de incisivo fraturado com resina composta de alta estética.",
      category: "Estética",
    },
  ];

  for (let i = 0; i < portfolio.length; i++) {
    const item = portfolio[i];
    await prisma.portfolioItem.upsert({
      where: { id: `pf-${i + 1}` },
      update: {},
      create: {
        id: `pf-${i + 1}`,
        clinicId: clinic.id,
        order: i,
        ...item,
      },
    });
  }

  console.log(`✅ ${portfolio.length} itens de portfólio criados`);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("  Super Admin  → super@odontoapp.com     / SuperAdmin@123");
  console.log("  Admin Clínica→ admin@sorrisoperfeito.com.br / Admin@123");
  console.log("  Recepção     → recepcao@sorrisoperfeito.com.br / Recepcao@123");
  console.log("\n🌐 Página pública: http://localhost:3000/c/sorriso-perfeito");
  console.log("🔐 Admin: http://localhost:3000/admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
