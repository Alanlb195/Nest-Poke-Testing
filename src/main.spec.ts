import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn().mockResolvedValue({
            useGlobalPipes: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn(),
        })
    }
}));

describe('main.ts bootstrap', () => {

    let mockApp: {
        useGlobalPipes: jest.Mock;
        setGlobalPrefix: jest.Mock;
        listen: jest.Mock;
    }

    beforeEach(() => {
        mockApp = {
            useGlobalPipes: jest.fn(),
            setGlobalPrefix: jest.fn(),
            listen: jest.fn(),
        };

        (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should create application with the AppModule', async () => {
        await bootstrap();
        expect(NestFactory.create).toHaveBeenCalledWith(AppModule)
    });

    it('should set global prefix', async () => {
        await bootstrap();
        expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    });

    it('should listen on port 3000 if .env PORT is not set', async () => {
        await bootstrap();
        expect(mockApp.listen).toHaveBeenCalledWith(3000);
    });

    it('should listen a custom .env PORT', async () => {

        process.env.PORT = '4200';

        await bootstrap();

        expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT);
    });


    it('should use the useGlobalPipes', async () => {

        await bootstrap();

        expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
            expect.objectContaining({
                validatorOptions: expect.objectContaining({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                })
            })
        );

        expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
            expect.any(ValidationPipe)
        );

    });


})