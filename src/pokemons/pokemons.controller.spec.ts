import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

const mockPokemons: Pokemon[] = [
  {
    "id": 1,
    "name": "bulbasaur",
    "type": "grass",
    "hp": 45,
    "sprites": [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png"
    ]
  },
  {
    "id": 2,
    "name": "ivysaur",
    "type": "grass",
    "hp": 60,
    "sprites": [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png"
    ]
  },
]

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have called the service with correct parameter', async () => {

    const dto: PaginationDto = { limit: 10, page: 1 };

    jest.spyOn(service, 'findAll');

    await controller.findAll(dto);

    expect(service.findAll).toHaveBeenCalled();
    expect(service.findAll).toHaveBeenCalledWith(dto);

  });

  it('should have been called the service findAll and check a valid result', async () => {

    const dto: PaginationDto = { limit: 10, page: 1 };

    jest.spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(mockPokemons));

    const pokemons = await controller.findAll(dto);

    expect(pokemons).toBe(mockPokemons);
    expect(pokemons.length).toBe(mockPokemons.length);

  });

  it('should have been called findOne with correct param', async () => {

    const spy = jest.spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve(mockPokemons[0]));

    const id = '1';

    const pokemon = await controller.findOne(id);

    expect(spy).toHaveBeenCalledWith(+id);
    expect(pokemon).toBe(mockPokemons[0]);
  });



  it('should have been called create with correct data', async () => {

    jest.spyOn(service, 'create')
      .mockImplementation(() => Promise.resolve(mockPokemons[0]));

    const dto: CreatePokemonDto = {
      name: 'Charmander',
      type: 'Fire'
    };

    await controller.create(dto);
    
    expect(service.create).toHaveBeenCalledWith(dto);

  });



  it('should have been called update with the correct id', async () => {

    jest.spyOn(service, 'update')
      .mockImplementation(() => Promise.resolve(mockPokemons[0]));

    const id = '1';
    const dto: UpdatePokemonDto = {
      name: 'Charmander',
      type: 'Fire'
    };

    await controller.update(id, dto);

    expect(service.update).toHaveBeenCalledWith(+id, dto);

  });


  it('should have been called delete', async () => {
    jest.spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve('Pokemon removed'));

    const id = '1';

    const result = await controller.remove(id);

    expect(result).toBe('Pokemon removed');
    expect(service.remove).toHaveBeenCalledWith(+id);

  });

});
