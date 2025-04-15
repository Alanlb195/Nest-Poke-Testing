import { Pokemon } from "./pokemon.entity"



describe('pokemon.entity.ts', () => {

    it ('should create a Pokemon instance', () => {

        const pokemon = new Pokemon();

        expect(pokemon).toBeInstanceOf(Pokemon);

    });


    it('should have this properties', () => {
        const pokemon = new Pokemon();
        pokemon.id = 1;
        pokemon.name = 'Bulbasaur'
        pokemon.type = ''
        pokemon.hp = 10
        pokemon.sprites = ['sprite1.png', 'sprite2.png'];

        expect(JSON.stringify(pokemon)).toEqual("{\"id\":1,\"name\":\"Bulbasaur\",\"type\":\"\",\"hp\":10,\"sprites\":[\"sprite1.png\",\"sprite2.png\"]}")
    });

})