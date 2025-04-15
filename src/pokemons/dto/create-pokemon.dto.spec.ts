
import 'reflect-metadata';
import { CreatePokemonDto } from './create-pokemon.dto';
import { validate } from 'class-validator';


describe('create-pokemon.dto.ts', () => {


    it('should be valid with correct data', async () => {

        const dto = new CreatePokemonDto();
        dto.name = 'Pikachu';
        dto.type = 'Electric';

        const errors = await validate(dto);

        expect(errors.length).toBe(0)

    });

    it('should be invalid if name is not present', async () => {

        const dto = new CreatePokemonDto();
        dto.type = 'Electric';

        const errors = await validate(dto);

        const nameError = errors.find((error) => error.property === 'name');

        expect(nameError).toBeDefined();
    });

    it('should be invalid if type is not present', async () => {

        const dto = new CreatePokemonDto();
        dto.name = 'Pikachu';

        const errors = await validate(dto);

        const typeError = errors.find((error) => error.property === 'type');

        expect(typeError).toBeDefined();
    });

    it('should hp must be positive number', async () => {
        const dto = new CreatePokemonDto();
        dto.name = 'Pikachu';
        dto.type = 'Electric';
        dto.hp = -10;

        const errors = await validate(dto);
        const hpError = errors.find((error) => error.property === 'hp');
        const constraints = hpError?.constraints;

        expect(constraints).toEqual({ min: 'hp must not be less than 0' });
        expect(hpError).toBeDefined();
    });


    it('should be invalid with non-string sprites', async () => {
        const dto = new CreatePokemonDto();
        dto.name = 'Pikachu';
        dto.type = 'Electric';
        dto.sprites = [123, 456] as unknown as string[];

        const errors = await validate(dto);

        const spritesError = errors.find((error) => error.property === 'sprites');
        const constraints = spritesError?.constraints;

        expect(constraints).toEqual({ isString: 'each value in sprites must be a string' });
        expect(spritesError).toBeDefined();
    });

    it('should be valid with string sprites', async () => {
        const dto = new CreatePokemonDto();
        dto.name = 'Pikachu';
        dto.type = 'Electric';
        dto.sprites = ['sprite1.png', 'sprite2.png'];

        const errors = await validate(dto);
        const spritesError = errors.find((error) => error.property === 'sprites');

        expect(spritesError).toBe(undefined);
    });

})