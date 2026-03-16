import path from 'node:path';
import request from 'supertest';
import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait,
} from 'testcontainers';

describe('ProductsController (e2e)', () => {
  jest.setTimeout(300_000);

  const dbAlias = 'mysql-db';
  const dbName = 'ecommerce';
  const dbUser = 'ecommerce_user';
  const dbPassword = 'ecommerce_pass';
  const dbRootPassword = 'root_pass';
  const dbPort = 3306;
  const appPort = 3000;
  const serviceImageName = `products-service-e2e:${Date.now()}`;

  let network: StartedNetwork | undefined;
  let dbContainer: StartedTestContainer | undefined;
  let serviceContainer: StartedTestContainer | undefined;
  let apiBaseUrl = '';

  beforeAll(async () => {
    const projectRoot = path.resolve(__dirname, '..');
    network = await new Network().start();
    const initSchemaSql = [
      `USE ${dbName};`,
      'CREATE TABLE IF NOT EXISTS products (',
      'id INT AUTO_INCREMENT PRIMARY KEY,',
      'product_token VARCHAR(128) NOT NULL UNIQUE,',
      'name VARCHAR(255) NOT NULL,',
      'price DECIMAL(10,2) NOT NULL,',
      'stock INT NOT NULL,',
      'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,',
      'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    ].join('\n');

    dbContainer = await new GenericContainer('mysql:8.4')
      .withEnvironment({
        MYSQL_DATABASE: dbName,
        MYSQL_USER: dbUser,
        MYSQL_PASSWORD: dbPassword,
        MYSQL_ROOT_PASSWORD: dbRootPassword,
      })
      .withCopyContentToContainer([
        {
          content: initSchemaSql,
          target: '/docker-entrypoint-initdb.d/01-products-schema.sql',
        },
      ])
      .withExposedPorts(dbPort)
      .withNetwork(network)
      .withNetworkAliases(dbAlias)
      .withWaitStrategy(Wait.forLogMessage(/ready for connections/i, 2))
      .withStartupTimeout(120_000)
      .start();

    const serviceImage = await GenericContainer.fromDockerfile(
      projectRoot,
      'Dockerfile',
    )
      .withBuildkit()
      .build(serviceImageName, { deleteOnExit: true });

    serviceContainer = await serviceImage
      .withEnvironment({
        NODE_ENV: 'test',
        PORT: appPort.toString(),
        DB_HOST: dbAlias,
        DB_PORT: dbPort.toString(),
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword,
        SWAGGER_ENABLED: 'false',
      })
      .withExposedPorts(appPort)
      .withNetwork(network)
      .withWaitStrategy(
        Wait.forLogMessage(/Nest application successfully started/i),
      )
      .withStartupTimeout(180_000)
      .start();

    apiBaseUrl = `http://${serviceContainer.getHost()}:${serviceContainer.getMappedPort(appPort)}`;
  });

  afterAll(async () => {
    await serviceContainer?.stop();
    await dbContainer?.stop();
    await network?.stop();
  });

  it('/api/products (POST) rejects invalid payload', async () => {
    await request(apiBaseUrl)
      .post('/api/products')
      .send({
        name: 'A',
        productToken: '',
        price: -1,
        stock: -10,
      })
      .expect(400);
  });

  it('/api/products (POST) creates product and supports full CRUD', async () => {
    const createResponse = await request(apiBaseUrl)
      .post('/api/products')
      .send({
        name: 'Laptop Stand',
        productToken: 'SKU-1000',
        price: 59.99,
        stock: 10,
      })
      .expect(201);

    expect(createResponse.body.id).toBeGreaterThan(0);
    expect(createResponse.body.productToken).toBe('SKU-1000');
    expect(createResponse.body.name).toBe('Laptop Stand');
    expect(createResponse.body.price).toBe(59.99);
    expect(createResponse.body.stock).toBe(10);

    const createdId = createResponse.body.id as number;

    await request(apiBaseUrl)
      .post('/api/products')
      .send({
        name: 'Laptop Stand Duplicate',
        productToken: 'SKU-1000',
        price: 10.99,
        stock: 1,
      })
      .expect(409);

    const getOneResponse = await request(apiBaseUrl)
      .get(`/api/products/${createdId}`)
      .expect(200);
    expect(getOneResponse.body.id).toBe(createdId);
    expect(getOneResponse.body.productToken).toBe('SKU-1000');

    const listResponse = await request(apiBaseUrl)
      .get('/api/products?page=1&limit=10')
      .expect(200);
    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.total).toBeGreaterThanOrEqual(1);

    const updatedStock = 25;
    const updateResponse = await request(apiBaseUrl)
      .patch(`/api/products/${createdId}/stock`)
      .send({ stock: updatedStock })
      .expect(200);
    expect(updateResponse.body.stock).toBe(updatedStock);

    await request(apiBaseUrl).delete(`/api/products/${createdId}`).expect(204);

    await request(apiBaseUrl).get(`/api/products/${createdId}`).expect(404);
  });
});
