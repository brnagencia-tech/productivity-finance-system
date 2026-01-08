import * as db from "./server/db.js";

// Criar Karen (Master)
const karenPassword = Buffer.from("karen123").toString("base64");
try {
  const karen = await db.createManagedUser({
    email: "karen@agenciabrn.com.br",
    passwordHash: karenPassword,
    firstName: "Karen",
    lastName: "Maia",
    username: "karen",
    createdByUserId: 60001, // Bruno
  });
  console.log("✅ Karen criada:", karen);
  
  // Atualizar role para master
  await db.updateManagedUser(karen.id, 60001, { role: "master" });
  console.log("✅ Karen atualizada para Master");
} catch (error) {
  console.log("Karen já existe ou erro:", error.message);
}

// Criar Ruan (Programador)
const ruanPassword = Buffer.from("ruan123").toString("base64");
try {
  const ruan = await db.createManagedUser({
    email: "ruan@agenciabrn.com.br",
    passwordHash: ruanPassword,
    firstName: "Ruan",
    lastName: "Programador",
    username: "ruan",
    createdByUserId: 60001, // Bruno
  });
  console.log("✅ Ruan criado:", ruan);
} catch (error) {
  console.log("Ruan já existe ou erro:", error.message);
}

console.log("\n📝 Senhas:");
console.log("Karen: karen123");
console.log("Ruan: ruan123");

process.exit(0);
