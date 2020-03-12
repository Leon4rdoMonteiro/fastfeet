import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';

factory.define('UserCreate', User, {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
});

factory.define('UserUpdate', User, {
    name: faker.name.findName(),
    email: faker.internet.email(),
});

factory.define('Auth', User, {
    email: faker.internet.email(),
    password: faker.internet.password(),
});

export default factory;
