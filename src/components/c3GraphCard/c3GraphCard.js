import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardTitle, CardHeader, CardActions, CardBody, Title } from '@patternfly/react-core';
import _isEqual from 'lodash/isEqual';
import { Select } from '../form/select';
import { connect, reduxActions, reduxSelectors, reduxTypes, store } from '../../redux';
import { helpers, dateHelpers } from '../../common';
import { RHSM_API_QUERY_GRANULARITY_TYPES as GRANULARITY_TYPES, RHSM_API_QUERY_TYPES } from '../../types/rhsmApiTypes';
import { c3GraphCardHelpers } from './c3GraphCardHelpers';
import { C3GraphCardLegendItem } from './c3GraphCardLegendItem';
import { graphCardTypes } from '../graphCard/graphCardTypes';
import { C3Chart } from '../c3Chart/c3Chart';
import { Loader } from '../loader/loader';
import { translate } from '../i18n/i18n';

/**
 * ToDo: Convert "productShortLabel" prop to "productLabel" for consistency
 * This is dependent on ALL c3 components being removed as part of future updates.
 */
/**
 * A chart/graph card.
 *
 * @augments React.Component
 * @fires onUpdateGraphData
 * @fires onGranularitySelect
 */
class C3GraphCard extends React.Component {
  state = {};

  componentDidMount() {
    this.onUpdateGraphData();
  }

  componentDidUpdate(prevProps) {
    const { query, productId } = this.props;

    if (productId !== prevProps.productId || !_isEqual(query, prevProps.query)) {
      this.onUpdateGraphData();
    }
  }

  /**
   * Call the RHSM APIs, apply filters.
   *
   * @event onUpdateGraphData
   */
  onUpdateGraphData = () => {
    const { getGraphReportsCapacity, isDisabled, productId, query } = this.props;
    const graphGranularity = this.getQueryGranularity();

    if (!isDisabled && graphGranularity && productId) {
      const { startDate, endDate } = dateHelpers.getRangedDateTime(graphGranularity);
      const graphQuery = {
        [RHSM_API_QUERY_TYPES.START_DATE]: startDate.toISOString(),
        [RHSM_API_QUERY_TYPES.END_DATE]: endDate.toISOString(),
        ...query
      };

      getGraphReportsCapacity(productId, graphQuery);
    }
  };

  /**
   * On granularity select, dispatch granularity type.
   *
   * @event onGranularitySelect
   * @param {object} event
   */
  onGranularitySelect = (event = {}) => {
    const { value } = event;
    const { viewId } = this.props;

    store.dispatch({
      type: reduxTypes.query.SET_QUERY_RHSM_TYPES[RHSM_API_QUERY_TYPES.GRANULARITY],
      viewId,
      [RHSM_API_QUERY_TYPES.GRANULARITY]: value
    });
  };

  getQueryGranularity() {
    const { query } = this.props;
    return query?.[RHSM_API_QUERY_TYPES.GRANULARITY];
  }

  /**
   * Apply a custom legend.
   *
   * @param {object} options
   * @param {Function} options.chart
   * @param {Array} options.filteredData
   * @param {string} options.granularity
   * @param {Array} options.hiddenDataFacets
   * @returns {Array}
   */
  renderLegend({ chart, filteredData = [], granularity, hiddenDataFacets = [] }) {
    const { state } = this;
    const { productId, productShortLabel, t } = this.props;

    return filteredData.map(({ id }) => {
      const isThreshold = /^threshold/.test(id);
      const isDataHidden = hiddenDataFacets.includes(id);
      const tooltipContent = (
        <p>{(isThreshold && t(`curiosity-graph.thresholdLegendTooltip`)) || t(`curiosity-graph.${id}LegendTooltip`)}</p>
      );

      const getToggle = ({ isToggled }) => this.setState({ [`${productId}-${granularity}-${id}`]: isToggled });
      const isToggled = state[`${productId}-${granularity}-${id}`] || false;

      return (
        <C3GraphCardLegendItem
          key={`legend-${productId}-${granularity}-${id}`}
          chart={chart}
          chartId={id}
          tooltipContent={tooltipContent}
          isDisabled={isDataHidden}
          isThreshold={isThreshold}
          isToggled={isToggled}
          getToggle={getToggle}
        >
          {(isThreshold && t(`curiosity-graph.thresholdLabel`)) ||
            t(`curiosity-graph.${id}Label`, { product: productShortLabel })}
        </C3GraphCardLegendItem>
      );
    });
  }

  /**
   * Apply props to chart/graph.
   *
   * @returns {Node}
   */
  renderChart() {
    const { filterGraphData, graphData, productId, productShortLabel, selectOptionsType } = this.props;
    const graphGranularity = this.getQueryGranularity();
    const { selected } = graphCardTypes.getGranularityOptions(selectOptionsType);
    const updatedGranularity = graphGranularity || selected;

    if (!graphData || !Object.values(graphData).length) {
      return null;
    }

    const filtered = [];

    if (filterGraphData.length) {
      filterGraphData.forEach(filteredValue => {
        if (graphData[filteredValue.id]) {
          filtered.push({ ...filteredValue, data: [...graphData[filteredValue.id]] });
        }
      });
    } else {
      Object.keys(graphData).forEach(id => {
        filtered.push({ id, data: [...graphData[id]] });
      });
    }

    const { configuration = {}, hiddenDataFacets = [] } = c3GraphCardHelpers.c3Config({
      data: filtered,
      granularity: updatedGranularity,
      productShortLabel
    });

    return (
      <C3Chart key={`chart-${productId}-${updatedGranularity}`} config={configuration}>
        {({ chart }) =>
          this.renderLegend({
            chart,
            filteredData: filtered,
            granularity: updatedGranularity,
            hiddenDataFacets
          })
        }
      </C3Chart>
    );
  }

  /**
   * Render a chart/graph card with chart/graph.
   *
   * @returns {Node}
   */
  render() {
    const { cardTitle, children, error, isDisabled, pending, selectOptionsType, t } = this.props;

    if (isDisabled) {
      return null;
    }

    const { options } = graphCardTypes.getGranularityOptions(selectOptionsType);
    const graphGranularity = this.getQueryGranularity();

    return (
      <Card className="curiosity-usage-graph">
        <CardHeader>
          <CardTitle>
            <Title headingLevel="h2" size="lg">
              {cardTitle}
            </Title>
          </CardTitle>
          <CardActions className={(error && 'blur') || ''}>
            {children}
            <Select
              aria-label={t('curiosity-graph.dropdownPlaceholder')}
              onSelect={this.onGranularitySelect}
              options={options}
              selectedOptions={graphGranularity}
              placeholder={t('curiosity-graph.dropdownPlaceholder')}
            />
          </CardActions>
        </CardHeader>
        <CardBody>
          <div className={(error && 'blur') || 'fadein'}>
            {pending && <Loader variant="graph" />}
            {!pending && this.renderChart()}
          </div>
        </CardBody>
      </Card>
    );
  }
}

/**
 * Prop types.
 *
 * @type {{productId: string, pending: boolean, error: boolean, query: object, cardTitle: string,
 *     filterGraphData: Array, getGraphReportsCapacity: Function, productShortLabel: string, selectOptionsType: string,
 *     viewId: string, t: Function, children: Node, graphData: object, isDisabled: boolean}}
 */
C3GraphCard.propTypes = {
  cardTitle: PropTypes.string,
  children: PropTypes.node,
  error: PropTypes.bool,
  filterGraphData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      color: PropTypes.string
    })
  ),
  getGraphReportsCapacity: PropTypes.func,
  graphData: PropTypes.object,
  query: PropTypes.shape({
    [RHSM_API_QUERY_TYPES.GRANULARITY]: PropTypes.oneOf([...Object.values(GRANULARITY_TYPES)]).isRequired
  }).isRequired,
  isDisabled: PropTypes.bool,
  pending: PropTypes.bool,
  productId: PropTypes.string.isRequired,
  selectOptionsType: PropTypes.oneOf(['default']),
  t: PropTypes.func,
  productShortLabel: PropTypes.string,
  viewId: PropTypes.string
};

/**
 * Default props.
 *
 * @type {{getGraphReportsCapacity: Function, productShortLabel: string, selectOptionsType: string,
 *     viewId: string, t: translate, children: null, pending: boolean, graphData: object,
 *     isDisabled: boolean, error: boolean, cardTitle: null, filterGraphData: Array}}
 */
C3GraphCard.defaultProps = {
  cardTitle: null,
  children: null,
  error: false,
  filterGraphData: [],
  getGraphReportsCapacity: helpers.noop,
  graphData: {},
  isDisabled: helpers.UI_DISABLED_GRAPH,
  pending: false,
  selectOptionsType: 'default',
  t: translate,
  productShortLabel: '',
  viewId: 'graphCard'
};

/**
 * Apply actions to props.
 *
 * @param {Function} dispatch
 * @returns {object}
 */
const mapDispatchToProps = dispatch => ({
  getGraphReportsCapacity: (id, query) => dispatch(reduxActions.rhsm.getGraphReportsCapacity(id, query))
});

/**
 * Create a selector from applied state, props.
 *
 * @type {Function}
 */
const makeMapStateToProps = reduxSelectors.graphCard.makeGraphCard();

const ConnectedGraphCard = connect(makeMapStateToProps, mapDispatchToProps)(C3GraphCard);

export { ConnectedGraphCard as default, ConnectedGraphCard, C3GraphCard };
