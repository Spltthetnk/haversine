import haversine, { CoordinateFormat, Unit, haversineIsWithin } from '../../src/haversine';
import { strict as assert } from 'assert';
import { suite, test } from 'mocha';

suite('haversine', function () {
  const start = {
    latitude: 38.898556,
    longitude: -77.037852
  };
  const startLatLon = [38.898556, -77.037852] as [number, number];
  const startLonLat = [-77.037852, 38.898556] as [number, number];
  const startLatLonObject = {
    lat: 38.898556,
    lon: -77.037852
  };
  const startLatLngObject = {
    lat: 38.898556,
    lng: -77.037852
  };
  const startGeoJson = {
    geometry: {
      coordinates: [-77.037852, 38.898556] as [number, number]
    }
  };

  const end = {
    latitude: 38.897147,
    longitude: -77.043934
  };
  const endLatLon = [38.897147, -77.043934] as [number, number];
  const endLonLat = [-77.043934, 38.897147] as [number, number];
  const endLatLonObject = {
    lat: 38.897147,
    lon: -77.043934
  };
  const endLatLngObject = {
    lat: 38.897147,
    lng: -77.043934
  };
  const endGeoJson = {
    geometry: {
      coordinates: [-77.043934, 38.897147] as [number, number]
    }
  };

  interface HaversineTestOptions {
    format?: CoordinateFormat;
    unit?: Unit;
  }

  // All tests are rounded for sanity.
  type TestCase = [any, any, number, HaversineTestOptions?];

  const tests: TestCase[] = [
    [start, end, 0.341, { unit: 'mile' }],
    [start, end, 0.549],
    [startLatLon, endLatLon, 0.341, { format: '[lat,lon]', unit: 'mile' }],
    [startLatLon, endLatLon, 0.549, { format: '[lat,lon]' }],
    [startLonLat, endLonLat, 0.341, { format: '[lon,lat]', unit: 'mile' }],
    [startLonLat, endLonLat, 0.549, { format: '[lon,lat]' }],
    [startLatLonObject, endLatLonObject, 0.341, { format: '{lon,lat}', unit: 'mile' }],
    [startLatLonObject, endLatLonObject, 0.549, { format: '{lon,lat}' }],
    [startLatLngObject, endLatLngObject, 0.341, { format: '{lat,lng}', unit: 'mile' }],
    [startLatLngObject, endLatLngObject, 0.549, { format: '{lat,lng}' }],
    [startGeoJson, endGeoJson, 0.341, { format: 'geojson', unit: 'mile' }],
    [startGeoJson, endGeoJson, 0.549, { format: 'geojson' }],
  ];

  tests.forEach(function (t, i) {
    if (i % 2 === 0) {
      test(`it should return ${t[2]} mi for ${JSON.stringify(t[0])} .. ${JSON.stringify(t[1])}`, function () {
        const result = haversine(t[0], t[1], Object.assign({ unit: 'mile' }, t[3])) as number;
        assert.equal(Math.abs((result - t[2]) / t[2]).toFixed(2), "0.00");
      });
    } else {
      test(`it should return ${t[2]} km for ${JSON.stringify(t[0])} .. ${JSON.stringify(t[1])}`, function () {
        const result = haversine(t[0], t[1], Object.assign({}, t[3])) as number;
        assert.equal(Math.abs((result - t[2]) / t[2]).toFixed(2), "0.00");
      });
    }
  });

  test('it should return true that distance is within 1 mi threshold', function () {
    assert.equal(true, haversineIsWithin(tests[0][0], tests[0][1], 1, { unit: 'mile' }));
  });

  test('it should return true that distance is within 1 km threshold', function () {
    assert.equal(true, haversineIsWithin(tests[1][0], tests[1][1], 1, { unit: 'km' }));
  });

  test('it should throw TypeError for invalid unit', function () {
    assert.throws(() => haversine(tests[0][0], tests[0][1], { unit: 'm' as any }), TypeError);
  });

  test('it should throw TypeError for invalid format', function () {
    // latitude is purposely spelled incorrectly
    assert.throws(() => haversine(tests[0][0], tests[0][1], { format: { lattitude: 0, longitude: 0 } as any }), TypeError);
  });
});
