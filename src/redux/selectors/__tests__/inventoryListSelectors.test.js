import inventoryListSelectors from '../inventoryListSelectors';
import { rhsmApiTypes } from '../../../types/rhsmApiTypes';

describe('InventoryListSelectors', () => {
  it('should return specific selectors', () => {
    expect(inventoryListSelectors).toMatchSnapshot('selectors');
  });

  it('should pass minimal data on missing a reducer response', () => {
    const state = {};
    expect(inventoryListSelectors.inventoryList(state)).toMatchSnapshot('missing reducer error');
  });

  it('should pass minimal data on a product ID without a product ID provided', () => {
    const props = {
      viewId: 'test',
      productId: undefined,
      query: {}
    };
    const state = {
      inventory: {
        hostsInventory: {
          fulfilled: true,
          metaId: undefined,
          metaQuery: {},
          data: { [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [] }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(state, props)).toMatchSnapshot('no product id error');
  });

  it('should handle pending state on a product ID', () => {
    const props = {
      viewId: 'test',
      productId: 'Lorem Ipsum ID pending state'
    };
    const state = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum ID pending state': {
            pending: true,
            metaId: 'Lorem Ipsum ID pending state',
            metaQuery: {},
            data: { [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [] }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(state, props)).toMatchSnapshot('pending');
  });

  it('should populate data on a product ID when the api response is missing expected properties', () => {
    const props = {
      viewId: 'test',
      productId: 'Lorem Ipsum missing expected properties',
      query: {
        [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
      }
    };
    const state = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum missing expected properties': {
            fulfilled: true,
            metaId: 'Lorem Ipsum missing expected properties',
            metaQuery: {
              [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
            },
            data: {
              [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: 'd6214a0b-b344-4778-831c-d53dcacb2da3',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.CORES]: 2,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.SOCKETS]: 1
                },
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: '9358e312-1c9f-42f4-8910-dcef6e970852',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.NAME]: 'db.example.com',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.HARDWARE]: 'physical',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.LAST_SEEN]: '2019-09-04T00:00:00.000Z'
                }
              ]
            }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(state, props)).toMatchSnapshot('data populated, missing properties');
  });

  it('should map a fulfilled product ID response to an aggregated output', () => {
    const props = {
      viewId: 'test',
      productId: 'Lorem Ipsum fulfilled aggregated output',
      query: {
        [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
      }
    };
    const state = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum fulfilled aggregated output': {
            fulfilled: true,
            metaId: 'Lorem Ipsum fulfilled aggregated output',
            metaQuery: {
              [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
            },
            data: {
              [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: 'd6214a0b-b344-4778-831c-d53dcacb2da3',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.NAME]: 'db.lorem.com',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.CORES]: 2,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.SOCKETS]: 1,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.HARDWARE]: 'physical',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.LAST_SEEN]: '2019-07-03T00:00:00.000Z'
                },
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: '9358e312-1c9f-42f4-8910-dcef6e970852',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.NAME]: 'db.ipsum.com',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.CORES]: 2,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.SOCKETS]: 1,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.HARDWARE]: 'physical',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.LAST_SEEN]: '2019-09-04T00:00:00.000Z'
                }
              ]
            }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(state, props)).toMatchSnapshot('fulfilled');
  });

  it('should populate data from the in memory cache', () => {
    const props = {
      viewId: 'cache-test',
      productId: 'Lorem Ipsum ID cached',
      query: {
        [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
      }
    };
    const stateInitialFulfilled = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum ID cached': {
            fulfilled: true,
            metaId: 'Lorem Ipsum ID cached',
            metaQuery: {
              [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.PREMIUM
            },
            data: {
              [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: 'd6214a0b-b344-4778-831c-d53dcacb2da3',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.NAME]: 'db.lorem.com',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.CORES]: 2,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.SOCKETS]: 1,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.HARDWARE]: 'physical',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.LAST_SEEN]: '2019-07-03T00:00:00.000Z'
                }
              ]
            }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(stateInitialFulfilled, props)).toMatchSnapshot(
      'cached data: initial fulfilled'
    );

    const statePending = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum ID cached': {
            ...stateInitialFulfilled.inventory.hostsInventory['Lorem Ipsum ID cached'],
            pending: true
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(statePending, props)).toMatchSnapshot(
      'cached data: cache used and pending'
    );

    const stateFulfilled = {
      inventory: {
        hostsInventory: {
          'Lorem Ipsum ID cached': {
            ...stateInitialFulfilled.inventory.hostsInventory['Lorem Ipsum ID cached'],
            fulfilled: true,
            data: {
              [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA]: [
                {
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.ID]: '9358e312-1c9f-42f4-8910-dcef6e970852',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.NAME]: 'db.ipsum.com',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.CORES]: 2,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.SOCKETS]: 1,
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.HARDWARE]: 'physical',
                  [rhsmApiTypes.RHSM_API_RESPONSE_INVENTORY_DATA_TYPES.LAST_SEEN]: '2019-09-04T00:00:00.000Z'
                }
              ]
            }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(stateFulfilled, props)).toMatchSnapshot(
      'cached data: updated and fulfilled'
    );

    const stateFulfilledQueryMismatch = {
      graph: {
        reportCapacity: {
          'Lorem Ipsum ID cached': {
            ...stateInitialFulfilled.inventory.hostsInventory['Lorem Ipsum ID cached'],
            metaQuery: {
              [rhsmApiTypes.RHSM_API_QUERY_TYPES.SLA]: rhsmApiTypes.RHSM_API_QUERY_SLA_TYPES.NONE
            }
          }
        }
      }
    };

    expect(inventoryListSelectors.inventoryList(stateFulfilledQueryMismatch, props)).toMatchSnapshot(
      'cached data: ERROR, query mismatch'
    );
  });
});
