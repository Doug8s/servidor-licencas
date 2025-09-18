// Conteúdo para o arquivo: servidor-licencas/index.js - VERSÃO FINAL

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Rota para "acordar" o servidor e verificar se está online
app.get("/", (req, res) => {
    res.send("Servidor de licenças está no ar e funcionando.");
});

// Rota de ativação
app.post('/api/activate', async (req, res) => {
    const { key, machineId } = req.body;

    if (!key || !machineId) {
        return res.status(400).json({ success: false, message: 'Chave e ID da máquina são obrigatórios.' });
    }

    try {
        const license = await prisma.license.findUnique({
            where: { key: key },
        });

        if (!license) {
            return res.status(404).json({ success: false, message: 'Chave de licença não encontrada.' });
        }

        if (license.isActivated && license.machineId !== machineId) {
            return res.status(403).json({ success: false, message: 'Esta chave já foi ativada em outro computador.' });
        }

        if (license.isActivated && license.machineId === machineId) {
            return res.status(200).json({ success: true, message: 'Licença revalidada com sucesso.' });
        }

        await prisma.license.update({
            where: { key: key },
            data: {
                machineId: machineId,
                isActivated: true,
            },
        });

        return res.status(200).json({ success: true, message: 'Aplicativo ativado com sucesso!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro interno no servidor.' });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Servidor de licenciamento rodando na porta ${PORT}`);
});