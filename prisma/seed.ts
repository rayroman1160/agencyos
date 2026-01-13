import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const stages = [
        { name: 'Lead', order: 1 },
        { name: 'Discovery', order: 2 },
        { name: 'Proposal', order: 3 },
        { name: 'Negotiation', order: 4 },
        { name: 'Closed Won', order: 5 },
        { name: 'Closed Lost', order: 6 },
    ]

    console.log('Seeding Pipeline Stages...')
    for (const stage of stages) {
        await prisma.pipelineStage.create({
            data: stage
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
