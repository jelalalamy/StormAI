import { useEffect } from 'react';
import { Node, Edge, Position, ReactFlowState, useStore, useReactFlow } from 'reactflow';
import { stratify, tree } from 'd3-hierarchy';

// the layout direction (T = top, R = right, B = bottom, L = left, TB = top to bottom, ...)

const positionMap = {
  T: Position.Top,
  L: Position.Left,
  R: Position.Right,
  B: Position.Bottom,
};

const getPosition = (x, y, direction) => {
  switch (direction) {
    case 'LR':
      return { x: y, y: x };
    case 'RL':
      return { x: -y, y: -x };
    case 'BT':
      return { x: -x, y: -y };
    default:
      return { x, y };
  }
};

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const layout = tree()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([130, 120])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const nodeCountSelector = (state) => state.nodeInternals.size;
const nodesInitializedSelector = (state) =>
  Array.from(state.nodeInternals.values()).every((node) => node.width && node.height);

function useAutoLayout(options) {
  const { direction } = options;
  const nodeCount = useStore(nodeCountSelector);
  const nodesInitialized = useStore(nodesInitializedSelector);
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();

  useEffect(() => {
    // only run the layout if there are nodes and they have been initialized with their dimensions
    if (!nodeCount || !nodesInitialized) {
      return;
    }

    const nodes = getNodes();
    const edges = getEdges();

    const hierarchy = stratify()
      .id((d) => d.id)
      // get the id of each node by searching through the edges
      // this only works if every node has one connection
      .parentId((d) => edges.find((e) => e.target === d.id)?.source)(nodes);

    // run the layout algorithm with the hierarchy data structure
    const root = layout(hierarchy);

    // set the React Flow nodes with the positions from the layout
    setNodes((nodes) =>
      nodes.map((node) => {
        // find the node in the hierarchy with the same id and get its coordinates
        const { x, y } = root.find((d) => d.id === node.id) || { x: node.position.x, y: node.position.y };

        return {
          ...node,
          sourcePosition: positionMap[direction[1]],
          targetPosition: positionMap[direction[0]],
          position: getPosition(x, y, direction),
          style: { opacity: 1 },
        };
      })
    );

    setEdges((edges) => edges.map((edge) => ({ ...edge, style: { opacity: 1 } })));
  }, [nodeCount, nodesInitialized, getNodes, getEdges, setNodes, setEdges, fitView, direction]);
}

export default useAutoLayout;
