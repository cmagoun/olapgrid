import * as Utils from './Utils';

it('can roll profiling into a wrapper function', () => {
    const testFunc = (a, b, c) => {
        console.log(a);
        console.log(b);
        console.log(c);

        return a+b+c;
    };

    const profile = Utils.withProfiling(true);

    //was testFunc(1,2,3) -- call now looks like this
    const result = profile("test", testFunc)(1,2,3);
    expect(result).toBe(6);
});