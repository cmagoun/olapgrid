import faker from 'faker';

export const createData = (size) => {
    const goods  = [];

    for(let i = 0; i < 500; i++) {
        const name = faker.commerce.productName();
        const arrName = name.split(" ");
        const adjective = arrName[0];
        const material = arrName[1];
        const category = arrName[2];

        goods.push({
            id: `Item-${i}`,
            name,
            adjective,
            material,
            category,
            department: faker.commerce.department(),
            price: faker.commerce.price(),
        });
    }

    const result = [];

    for(let i = 0; i < size; i++) {
        const product = goods[faker.random.number({min:0, max: 499})];
        const qty =  faker.random.number({min: 1, max: 10});
        const price = parseFloat(product.price);
        const amt = qty * price;

        result.push({
            productid: product.id,
            name: product.name,
            material: product.material,
            department: product.department,
            category: product.category,
            adjective: product.adjective,
            salesDate: faker.date.past(1),
            qty,
            price,
            amt
        });
    }

    return result;
}
