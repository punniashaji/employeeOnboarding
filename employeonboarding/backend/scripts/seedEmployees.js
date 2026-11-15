require("dotenv").config();

const { prisma } = require("../config/dbConnection");
const departments = require("../config/departments");

const firstNames = [
    "Alex", "Avery", "Blake", "Cameron", "Casey",
    "Charlie", "Drew", "Jamie", "Jordan", "Morgan"
];
const lastNames = ["Bennett", "Carter", "Hayes", "Morgan", "Reed"];

const employees = Array.from({ length: 50 }, (_, index) => {
    const number = index + 1;
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length)];
    const birthYear = 1975 + (index % 20);
    const birthMonth = index % 12;

    return {
        name: `${firstName} ${lastName}`,
        email: `sample.employee${String(number).padStart(2, "0")}@example.com`,
        mobile: String(6000000000 + number),
        dob: new Date(Date.UTC(birthYear, birthMonth, 10)),
        department: departments[index % departments.length],
        designation: "Employee",
        joiningDate: new Date(Date.UTC(2022 + (index % 4), index % 12, 1)),
        address: `${100 + number} Sample Street`
    };
});

const seedEmployees = async () => {
    if (!process.argv.includes("--apply")) {
        const counts = departments.map((department) => ({
            department,
            count: employees.filter((employee) => employee.department === department).length
        }));
        console.log("Dry run: prepared 50 synthetic employees.");
        console.table(counts);
        console.log("To insert these rows into the configured database, run: npm run seed-employees -- --apply");
        return;
    }

    const emails = employees.map((employee) => employee.email);
    const existing = await prisma.employee.findMany({
        where: { email: { in: emails } },
        select: { email: true }
    });
    const existingEmails = new Set(existing.map((employee) => employee.email));
    const newEmployees = employees.filter((employee) => !existingEmails.has(employee.email));

    if (newEmployees.length === 0) {
        console.log("No employees created; all sample email addresses already exist.");
        return;
    }

    const result = await prisma.employee.createMany({ data: newEmployees });
    console.log(`Created ${result.count} employees; skipped ${employees.length - result.count} existing sample email(s).`);
};

seedEmployees()
    .catch((error) => {
        console.error("Employee seeding failed:", error.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
