import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

describe('PokemonsService', () => {
  let service: PokemonsService;
  let fetchSpy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
    service.paginatedPokemonCached.clear();
    service.pokemonsCache.clear();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  })


  it('should create a pokemon (create)', async () => {
    const dto: CreatePokemonDto = { name: 'pika', type: 'electric' }

    const result = await service.create(dto);

    // console.log(result);

    await expect(result).toEqual(
      expect.objectContaining(
        {
          ...dto
        }
      )
    )
  });

  it('should throw an error if pokemon exists (create)', async () => {

    const data = { name: 'pika', type: 'electric' }

    await service.create(data);

    await expect(service.create(data)).rejects.toThrow(BadRequestException);

  });


  it('should return a pokemon if it exists (findOne)', async () => {
    const pokemonId = 10;
    const result = await service.findOne(pokemonId);
    expect(result).toBeDefined();
  });


  it('should check correct properties of the pokemon (findOne)', async () => {
    const pokemonId = 10;
    const result = await service.findOne(pokemonId);

    expect(result).toEqual(
      expect.objectContaining({
        id: pokemonId,
        hp: expect.any(Number),
      })
    )

  });

  it('should return 404 if pokemon doesnt exist (findOne)', async () => {

    const pokemonId = 400_000;

    await expect(service.findOne(pokemonId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(pokemonId)).rejects.toThrow(`Pokemon with id ${pokemonId} not found`);
  });


  it('should return pokemons from cache (findOne)', async () => {
    const id = 1;
    const cacheSpy = jest.spyOn(service.pokemonsCache, 'get');

    await service.findOne(id);
    await service.findOne(id);

    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith(id);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });


  it('should find all pokemons and cache them (findAll)', async () => {

    const pokemons = await service.findAll({
      limit: 4, page: 1
    });

    expect(pokemons).toBeInstanceOf(Array);
    expect(pokemons.length).toBe(4);

    expect(service.paginatedPokemonCached.has('4-1')).toBeTruthy();
    expect(service.paginatedPokemonCached.get('4-1')).toBe(pokemons);

  });

  it('should return pokemons from cache (findAll)', async () => {

    const cacheSpy = jest.spyOn(service.paginatedPokemonCached, 'get')
    const fetchSpy = jest.spyOn(global, 'fetch');

    await service.findAll({ limit: 4, page: 1 });
    await service.findAll({ limit: 4, page: 1 });


    expect(cacheSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith("4-1");

    expect(fetchSpy).toHaveBeenCalledTimes(5);

  });


  it('should return cached data on second call', async () => {
    const first = await service.findAll({ limit: 2, page: 1 });
    const second = await service.findAll({ limit: 2, page: 1 });

    expect(second).toBe(first);
  });


  it('should update pokemon', async () => {

    const id = 1;
    const dto: UpdatePokemonDto = { name: 'Charmander' }

    const updatedPokemon = await service.update(id, dto);

    // console.log(updatedPokemon);

    expect(updatedPokemon).toEqual(
      {
        id: 1,
        name: 'Charmander',
        type: 'grass',
        hp: 45,
        sprites: [
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png'
        ]
      }
    )
  });

  it('should not update pokemon if not exists', async () => {

    const id = 1_000_000;

    const dto: UpdatePokemonDto = { name: 'Charmander2' };

    try {
      await service.update(id, dto);
      expect(true).toBeFalsy();
    } catch (error) {
      // console.log(error);
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(`Pokemon with id ${id} not found`)

    }

  });


  it('should remove pokemon from cached', async () => {

    const id = 1;

    service.findOne(id);

    await service.remove(id);

    expect(service.pokemonsCache.get(id)).toBeUndefined();

  });



});
