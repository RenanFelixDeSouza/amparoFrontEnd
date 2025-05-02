import React, { useState, useRef } from 'react';
import { FaChevronRight, FaChevronDown, FaFolder, FaFolderOpen, FaFile, FaTimes } from 'react-icons/fa';
import './ChartAccount.css';

function ChartAccountTree({ accounts = [], onSelect, selectedId }) {
  const [expandedItems, setExpandedItems] = useState({});
  const treeRef = useRef(null);

  const toggleNode = (accountId) => {
    setExpandedItems(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const closeAllFolders = () => {
    setExpandedItems({});
  };

  const buildTreeData = (items, parentId = null, level = 0) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        level,
        children: buildTreeData(items, item.id, level + 1)
      }));
  };

  const renderTreeNode = (node, isLast = false) => {
    const isExpanded = expandedItems[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSynthetic = node.type === 'synthetic';
    const paddingLeft = node.level * 20;

    return (
      <div key={node.id} className="tree-node">
        <div 
          className={`tree-node-content ${selectedId === node.id ? 'selected' : ''}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="node-controls" onClick={() => hasChildren && toggleNode(node.id)}>
            {hasChildren && (
              <span className="expand-icon">
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            )}
            <span className="node-icon">
              {isSynthetic ? (
                isExpanded ? 
                  <FaFolderOpen className="folder-icon" /> : 
                  <FaFolder className="folder-icon" />
              ) : (
                <FaFile className="file-icon" />
              )}
            </span>
          </div>

          <div 
            className="node-info"
            onClick={() => onSelect(node)}
          >
            <span className="account-code">{node.account_code}</span>
            <span className="account-name">{node.name}</span>
            {isSynthetic && (
              <span className="children-count">
                ({node.children.length})
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children.map((child, index) => 
              renderTreeNode(child, index === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTreeData(accounts);

  return (
    <div className="chart-account-tree" ref={treeRef}>
      <div className="tree-header">
        <div className="tree-header-top">
          <h3>Plano de Contas</h3>
         
        </div>
        <div className="tree-legend">
          <span><FaFolder className="folder-icon" /> Conta Sintética</span>
          <span><FaFile style={{ color: '#6c757d' }} /> Conta Analítica</span>
        </div>
        <div className="tree-help">
          <h4>Regras de Criação:</h4>
          <ul>
            <li>Contas sintéticas podem conter outras contas sintéticas ou analíticas</li>
            <li>Contas analíticas só podem ser criadas dentro de contas sintéticas</li>
            <li>O código segue o formato: X.X.X (ex: 1.0.0, 1.1.0, 1.1.1)</li>
            <li>Cada nível deve ter mais números que o nível pai</li>
          </ul>
        </div>
      </div>
      <div className="tree-container custom-scrollbar">
      <button 
            className="close-all-folders-button"
            onClick={closeAllFolders}
            title="Fechar todas as pastas"
          >
            <FaTimes /> Fechar Guias
          </button>
        {treeData.map((node, index) => 
          renderTreeNode(node, index === treeData.length - 1)
        )}
      </div>

      <style jsx>{`
        .chart-account-tree {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tree-header {
          padding: 16px;
          border-bottom: 1px solid #eee;
        }

        .tree-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .close-all-folders-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          background-color: #ffffff;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .close-all-folders-button:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
          color: #444;
        }

        .close-all-folders-button:active {
          background-color: #e5e7eb;
        }

        .tree-legend {
          display: flex;
          gap: 16px;
          font-size: 0.9em;
          color: #666;
        }

        .tree-container {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .tree-node {
          margin: 4px 0;
        }

        .tree-node-content {
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .tree-node-content:hover {
          background-color: #f5f5f5;
        }

        .tree-node-content.selected {
          background-color: #e3ff2fd;
        }

        .node-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
        }

        .node-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 8px;
        }

        .account-code {
          font-family: monospace;
          color: #666;
        }

        .account-name {
          font-weight: 500;
        }

        .children-count {
          color: #999;
          font-size: 0.9em;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .node-icon svg {
          color: #ffd700;
        }

        .node-icon .fa-folder,
        .node-icon .fa-folder-open {
          color: #ffd700;
        }

        .node-icon .fa-file {
          color: #6c757d !important;
        }

        .tree-legend .fa-folder,
        .tree-legend .fa-folder-open {
          color: #ffd700;
        }

        .tree-legend .fa-file {
          color: #6c757d !important;
        }
      `}</style>
    </div>
  );
}

export default ChartAccountTree;