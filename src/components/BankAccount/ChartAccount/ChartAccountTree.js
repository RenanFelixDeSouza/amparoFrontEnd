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
          <h4>Regras</h4>
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
          type="button"
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
    </div>
  );
}

export default ChartAccountTree;