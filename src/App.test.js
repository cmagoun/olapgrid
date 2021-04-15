import {createData} from './DatasetGenerator';


it('produces random data', () => {
  const data = createData(1000);
  //console.log(JSON.stringify(data));
  expect(data.length).toBe(1000);
});
