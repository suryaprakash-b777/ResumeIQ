/**
 * Database Seed Script for Prisma
 * Seeds Career Role Templates and Predefined Skills
 */
const { PrismaClient } = require('@prisma/client');
const { ROLE_TEMPLATES } = require('../utils/roleTemplates');
const { SKILL_DICTIONARY } = require('../utils/skillDictionary');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Skills
  console.log('Seeding skills dictionary...');
  let skillCount = 0;
  for (const [category, skills] of Object.entries(SKILL_DICTIONARY)) {
    for (const name of skills) {
      try {
        await prisma.skill.upsert({
          where: { name },
          update: { category },
          create: { name, category }
        });
        skillCount++;
      } catch (err) {
        // Ignore duplicate conflicts in upsert
      }
    }
  }
  console.log(`Successfully seeded/verified ${skillCount} skills.`);

  // 2. Seed Role Templates
  console.log('Seeding role templates...');
  for (const role of ROLE_TEMPLATES) {
    await prisma.roleTemplate.upsert({
      where: { title: role.title },
      update: {
        category: role.category,
        requiredSkills: JSON.stringify(role.requiredSkills),
        preferredSkills: JSON.stringify(role.preferredSkills),
        description: role.description
      },
      create: {
        title: role.title,
        category: role.category,
        requiredSkills: JSON.stringify(role.requiredSkills),
        preferredSkills: JSON.stringify(role.preferredSkills),
        description: role.description
      }
    });
  }
  console.log(`Successfully seeded ${ROLE_TEMPLATES.length} role templates.`);
  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

