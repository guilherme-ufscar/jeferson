import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("CoderMaster2026", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@locadora.com" },
    update: {
      name: "admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      name: "admin",
      email: "admin@locadora.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create operator user
  const operadorPassword = await bcrypt.hash("operador123", 10);
  const operador = await prisma.user.upsert({
    where: { email: "operador@locadora.com" },
    update: {
      name: "Operador",
      passwordHash: operadorPassword,
      role: Role.OPERADOR,
    },
    create: {
      name: "Operador",
      email: "operador@locadora.com",
      passwordHash: operadorPassword,
      role: Role.OPERADOR,
    },
  });

  // Create sample vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { placa: "ABC1D23" },
      update: {},
      create: {
        placa: "ABC1D23",
        tipo: "CARRO",
        marca: "Toyota",
        modelo: "Corolla",
        anoFabricacao: 2023,
        anoModelo: 2024,
        cor: "Prata",
        kmAtual: 15000,
        valorMensal: 3500,
        status: "DISPONIVEL",
        kmProximaTroca: 20000,
      },
    }),
    prisma.vehicle.upsert({
      where: { placa: "DEF2G34" },
      update: {},
      create: {
        placa: "DEF2G34",
        tipo: "CARRO",
        marca: "Honda",
        modelo: "Civic",
        anoFabricacao: 2022,
        anoModelo: 2023,
        cor: "Preto",
        kmAtual: 32000,
        valorMensal: 3200,
        status: "DISPONIVEL",
        kmProximaTroca: 35000,
      },
    }),
    prisma.vehicle.upsert({
      where: { placa: "GHI3J45" },
      update: {},
      create: {
        placa: "GHI3J45",
        tipo: "MOTO",
        marca: "Honda",
        modelo: "CG 160",
        anoFabricacao: 2024,
        anoModelo: 2024,
        cor: "Vermelha",
        kmAtual: 5000,
        valorMensal: 800,
        status: "DISPONIVEL",
        kmProximaTroca: 8000,
      },
    }),
    prisma.vehicle.upsert({
      where: { placa: "JKL4M56" },
      update: {},
      create: {
        placa: "JKL4M56",
        tipo: "CARRO",
        marca: "Volkswagen",
        modelo: "Gol",
        anoFabricacao: 2021,
        anoModelo: 2022,
        cor: "Branco",
        kmAtual: 48000,
        valorMensal: 2200,
        status: "DISPONIVEL",
        kmProximaTroca: 50000,
      },
    }),
    prisma.vehicle.upsert({
      where: { placa: "MNO5P67" },
      update: {},
      create: {
        placa: "MNO5P67",
        tipo: "MOTO",
        marca: "Yamaha",
        modelo: "Fazer 250",
        anoFabricacao: 2023,
        anoModelo: 2024,
        cor: "Azul",
        kmAtual: 12000,
        valorMensal: 1200,
        status: "DISPONIVEL",
        kmProximaTroca: 15000,
      },
    }),
  ]);

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { cpf: "12345678901" },
      update: {},
      create: {
        name: "João da Silva Santos",
        cpf: "12345678901",
        rg: "123456789",
        cnh: "12345678900",
        phone: "(11) 99999-0001",
        email: "joao@email.com",
        endereco: "Rua das Flores, 123",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01001-000",
        status: "ATIVO",
      },
    }),
    prisma.client.upsert({
      where: { cpf: "98765432100" },
      update: {},
      create: {
        name: "Maria Oliveira Lima",
        cpf: "98765432100",
        rg: "987654321",
        cnh: "98765432100",
        phone: "(11) 99999-0002",
        email: "maria@email.com",
        endereco: "Av. Brasil, 456",
        bairro: "Jardins",
        cidade: "São Paulo",
        estado: "SP",
        cep: "04001-000",
        status: "ATIVO",
      },
    }),
    prisma.client.upsert({
      where: { cpf: "11122233344" },
      update: {},
      create: {
        name: "Pedro Almeida Costa",
        cpf: "11122233344",
        rg: "111222333",
        cnh: "11122233344",
        phone: "(11) 99999-0003",
        email: "pedro@email.com",
        endereco: "Rua do Comércio, 789",
        bairro: "Vila Nova",
        cidade: "Campinas",
        estado: "SP",
        cep: "13001-000",
        status: "ATIVO",
      },
    }),
  ]);

  // Create company settings
  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "LocaFácil Veículos",
      cnpj: "12.345.678/0001-90",
      endereco: "Av. Principal, 1000 - Centro, São Paulo - SP",
      telefone: "(11) 3000-0000",
      email: "contato@locafacil.com.br",
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   Admin: ${admin.name} (${admin.email}) / CoderMaster2026`);
  console.log(`   Operador: ${operador.email} / operador123`);
  console.log(`   Vehicles: ${vehicles.length}`);
  console.log(`   Clients: ${clients.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
