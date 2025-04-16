import { Test, TestingModule } from '@nestjs/testing';
import { Body, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { CreatePokemonDto } from 'src/pokemons/dto/create-pokemon.dto';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );
    await app.init();
  });

  it('/pokemons (Post) - with no body', async () => {
    const response = await request(app.getHttpServer()).post('/pokemons');

    const mustHaveErrorMessage = [
      'name must be a string',
      'name should not be empty',
      'type must be a string',
      'type should not be empty'
    ]

    const messageArray = response.body.message ?? [];

    expect(response.statusCode).toBe(400);
    expect(mustHaveErrorMessage.length).toBe(messageArray.length);
    expect(messageArray).toEqual(
      expect.arrayContaining(mustHaveErrorMessage)
    )
  });


  it('/pokemons (Post) - with valid body', async () => {
    const pokemon: CreatePokemonDto = { name: 'Pikachu', type: 'Electric' };

    const response = (
      await request(app.getHttpServer())
        .post('/pokemons')
        .send(pokemon)
    );

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toEqual({
      name: 'Pikachu',
      type: 'Electric',
      id: expect.any(Number),
      hp: 0,
      sprites: []
    })

  });


  it('/pokemons (Get) - Should return paginated list of pokemons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons')
      .query({ page: 1, limit: 5 })

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);


    (response.body as Pokemon[]).forEach((pokemon) => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('type');
      expect(pokemon).toHaveProperty('hp');
      expect(pokemon).toHaveProperty('sprites');
    })
  });


  it('/pokemons (Get) - Should return a pokemon by id', async () => {

    const pokemonId = 1;

    const response = await request(app.getHttpServer())
      .get(`/pokemons/${pokemonId}`)

    const pokemon = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemon).toEqual({
      id: 1,
      name: 'bulbasaur',
      type: 'grass',
      hp: 45,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png'
      ]
    })
  });


  it('/pokemons/:id (Get) - Should return a charmander by id', async () => {

    const pokemonId = 4;

    const response = await request(app.getHttpServer())
      .get(`/pokemons/${pokemonId}`)

    const pokemon = response.body as Pokemon;

    expect(response.statusCode).toBe(200);
    expect(pokemon).toEqual({
      id: 4,
      name: 'charmander',
      type: 'fire',
      hp: 39,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png'
      ]
    })
  })

  it('/pokemons/:id (Get) should return Not Found', async () => {
    const pokemonId = 4_000_000;

    const response = await request(app.getHttpServer())
      .get(`/pokemons/${pokemonId}`)

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404
    })
  })


  it('/pokemons/:id (Patch) should update a pokemon', async () => {
    const pokemonId = 1;
    const dto = { name: 'Pikachu', type: 'Electric' }

    const pokemonResponse = await request(app.getHttpServer())
      .get(`/pokemons/${pokemonId}`);
    // console.log(pokemonResponse.body);

    const bulbasaur = pokemonResponse.body as Pokemon;

    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send(dto)

    expect(response.statusCode).toBe(200);
    // console.log(response.body);

    const updatedPokemon = response.body as Pokemon;

    expect(bulbasaur.hp).toBe(updatedPokemon.hp);
    expect(bulbasaur.id).toBe(updatedPokemon.id);
    expect(bulbasaur.sprites).toEqual(updatedPokemon.sprites);

    expect(updatedPokemon.name).toBe(dto.name);
    expect(updatedPokemon.type).toBe(dto.type);
  })



  it('/pokemons/:id (Patch) should throw an 404', async () => {
    const pokemonId = 4_000_000;

    const response = await request(app.getHttpServer())
      .patch(`/pokemons/${pokemonId}`)
      .send({})

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404
    })
  })


  it('/pokemons/:id (Delete) should delete a pokemon', async () => {
    const pokemonId = 1;

    const response = await request(app.getHttpServer())
      .delete(`/pokemons/${pokemonId}`)

    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual(`Pokemon #bulbasaur removed`);
  })


  it('/pokemons/:id (Delete) should throw an 404', async () => {
    const pokemonId = 4_000_000;

    const response = await request(app.getHttpServer())
      .delete(`/pokemons/${pokemonId}`)

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Pokemon with id ${pokemonId} not found`,
      error: 'Not Found',
      statusCode: 404
    })
  })


});
