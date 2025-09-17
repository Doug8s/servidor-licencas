// Conteúdo para o arquivo: servidor-licencas/index.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Esta é a única rota da nossa API.
// O seu App Desktop vai chamar esta rota para tentar ativar.
app.post('/api/activate', async (req, res) => {
    const { key, machineId } = req.body;

    if (!key || !machineId) {
        return res.status(400).json({ success: false, message: 'Chave e ID da máquina são obrigatórios.' });
    }

    try {
        const license = await prisma.license.findUnique({
            where: { key: key },
        });

        // 1. A chave existe?
        if (!license) {
            return res.status(404).json({ success: false, message: 'Chave de licença não encontrada.' });
        }

        // 2. A chave já foi ativada em outra máquina?
        if (license.isActivated && license.machineId !== machineId) {
            return res.status(403).json({ success: false, message: 'Esta chave já foi ativada em outro computador.' });
        }

        // 3. Se a chave já foi ativada nesta mesma máquina, apenas confirme que está tudo OK.
        if (license.isActivated && license.machineId === machineId) {
            return res.status(200).json({ success: true, message: 'Licença revalidada com sucesso.' });
        }

        // 4. Se chegou até aqui, é uma ativação nova e válida!
        // Atualizamos o banco de dados com o ID da máquina.
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
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor.' });
    }
});

const PORT = 3003; // Usaremos uma porta diferente para não conflitar com seu app
app.listen(PORT, () => {
    console.log(`Servidor de licenciamento rodando em http://localhost:${PORT}`);
});