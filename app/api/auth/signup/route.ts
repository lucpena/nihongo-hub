import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/database/mongodb';
// import dbConnect from '@/database/mongodb-dry';
import User from '@/models/user.model';

export async function POST(request: Request) {
    try {
        // 1. Conecta ao banco de dados
        await dbConnect();

        // 2. Extrai os dados do corpo da requisição
        const body = await request.json();
        const { name, email, password } = body;

        // 3. Validação básica
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Por favor, preencha todos os campos.' },
                { status: 400 }
            );
        }

        // 4. Verifica se o e-mail já está em uso
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Este e-mail já está cadastrado.' },
                { status: 400 }
            );
        }

        // 5. Criptografa a senha (Hash)
        // O número 10 é o "salt rounds", um bom equilíbrio entre segurança e performance
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Cria o usuário no MongoDB
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            // A imagem fica vazia por padrão, e as settings puxam o default do Model
        });

        // 7. Retorna sucesso (não retorne a senha, mesmo criptografada, por segurança)
        return NextResponse.json(
            { message: 'Usuário criado com sucesso!', userId: newUser._id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Erro no signup:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}