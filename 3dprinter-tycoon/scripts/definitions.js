import Model from './models/Model.js';
import Printer from './models/Printer.js';
import FilamentRoll from './models/FilamentRoll.js';

export const models = [
    new Model('Vase', 10, 10, 5, [13,14,15,15,15,14,13,12,11,10,10,10,11,12,13]),
    new Model('Lampshade', 10, 15, 10, [19,18.5,18,17.5,17,16.5,16,15.5,15,14.5]),
    new Model('Phone Case', 3, 40, 12, [19,20,19]),
];

export const printers = [
    new Printer('Ender 3', 10, 1, 400),
    new Printer('Bambu A1', 20, 1.2, 700),
];

export const filaments = [
    new FilamentRoll(1, 'Red', 'PLA'),
    new FilamentRoll(1, 'Blue', 'PLA'),
    new FilamentRoll(1, 'Green', 'PLA'),
    new FilamentRoll(1, 'Black', 'PLA'),
    new FilamentRoll(1, 'White', 'PLA'),
];

export const colorCodes = {
    'Red': '#dc4848',
    'Blue': '#4665fd',
    'Green': '#4fdc6f',
    'Black': '#000000',
    'White': '#ffffff'
}