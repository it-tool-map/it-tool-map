"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Edge,
  Connection,
  Node as ReactFlowNode,
  Handle,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import ReactModal from 'react-modal';
import { supabase } from '../lib/supabaseClient'; // Supabaseクライアントをインポート

const initialEdges: Edge[] = [];

const CustomNode = ({ data }: { data: NodeProps['data'] & { allProducts: Array<{ name: string, categories: number[] }> } }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<string[]>([]);

  const toggleProducts = () => {
    if (!showProducts && data.allProducts) {
      const filteredProducts = data.allProducts
        .filter(product => product.categories.includes(parseInt(data.category, 10)))
        .map(product => product.name);
      setProducts(filteredProducts);
    }
    setShowProducts((prev) => !prev);
  };

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
    setShowProducts(false); // モーダルを閉じる
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff' }}>
      <div>{data.label}</div>
      <button style={{ marginTop: '5px' }} onClick={toggleProducts}>
        {selectedProduct || '+'}
      </button>
      <ReactModal
        isOpen={showProducts}
        onRequestClose={toggleProducts}
        contentLabel="製品リスト"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <h2>{data.label}の製品</h2>
        <button onClick={toggleProducts}>閉じる</button>
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              <input
                type="radio"
                name="product"
                id={`product-${index}`}
                onChange={() => handleProductChange(product)}
                checked={selectedProduct === product}
              />
              <label htmlFor={`product-${index}`}>{product}</label>
            </li>
          ))}
        </ul>
      </ReactModal>
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

const nodeTypes = { default: CustomNode };

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number, name: string }>>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allProducts, setAllProducts] = useState<Array<{ name: string, categories: number[] }>>([]);

  useEffect(() => {
    // Supabaseからカテゴリデータを取得し、ノードとして使用
    const fetchCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData);

        const formattedNodes = categoriesData.map((category: { id: number, name: string }, index: number) => ({
          id: category.id.toString(),
          data: { label: category.name, category: category.id.toString(), products: [] },
          position: { x: 100 * index, y: 100 * index }
        }));
        setNodes(formattedNodes);
      }
    };

    // Supabaseからすべての製品データを取得
    const fetchAllProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          products,
          product_categories (
            category_id
          )
        `);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        const formattedProducts = productsData.map((product: { products: string, product_categories: Array<{ category_id: number }> }) => ({
          name: product.products,
          categories: product.product_categories.map(pc => pc.category_id)
        }));
        setAllProducts(formattedProducts);
      }
    };

    fetchCategories();
    fetchAllProducts();
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const filteredNodes = selectedCategories.length > 0
    ? nodes.filter((node: ReactFlowNode) =>
        node.data.category && selectedCategories.includes(parseInt(node.data.category, 10)) // カテゴリIDでフィルタリング
      )
    : []; // カテゴリが選択されていない場合、ノードを表示しない

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h3>Categories</h3>
        {categories.map((category) => (
          <div key={category.id}>
            <input
              type="checkbox"
              id={`category-${category.id}`}
              onChange={() => handleCategoryChange(category.id)}
              checked={selectedCategories.includes(category.id)}
            />
            <label htmlFor={`category-${category.id}`}>{category.name}</label>
          </div>
        ))}
      </div>
      <div style={{ flexGrow: 1, height: '100%' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={filteredNodes.map((node: ReactFlowNode) => {
              const nodeWithProducts = {
                ...node,
                data: { ...node.data, allProducts: allProducts }
              };
              return nodeWithProducts;
            })}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={nodeTypes}
            style={{ width: '100%', height: '100%' }}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}