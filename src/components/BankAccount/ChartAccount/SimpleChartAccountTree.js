import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import './ChartAccount.css';

function SimpleChartAccountTree({ accounts = [], onSelect, selectedId }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (accountId, e) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const buildHierarchy = (items) => {
    return items
      .filter(item => !item.parent_id)
      .map(item => ({
        ...item,
        children: getChildren(items, item.id)
      }));
  };

  const getChildren = (items, parentId) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: getChildren(items, item.id)
      }));
  };

  const renderAccount = (account, level = 0, isLastChild = true) => {
    const isSynthetic = account.type === 'synthetic';
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedItems[account.id];

    return (
      <div key={account.id} className="chart-account-item">
        <div 
          className={`chart-account-header ${selectedId === account.id ? 'selected' : ''}`}
          onClick={() => onSelect(account)}
        >
          <div className="account-info">
            <span className="level-indicator" style={{ marginLeft: `${level * 24}px` }}>
              {level > 0 && (
                <span className="tree-line">
                  {isLastChild ? '└─' : '├─'}
                </span>
              )}
              {isSynthetic ? (
                <span className="folder-icon" onClick={(e) => toggleExpand(account.id, e)}>
                  {isExpanded ? <FaFolderOpen className="icon-folder" /> : <FaFolder className="icon-folder" />}
                  {hasChildren && (
                    isExpanded ? <FaChevronDown className="icon-arrow" /> : <FaChevronRight className="icon-arrow" />
                  )}
                </span>
              ) : (
                <FaFile className="icon-file" />
              )}
            </span>
            <span className="account-code">{account.account_code}</span>
            <span className="account-name">{account.name}</span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="chart-account-children">
            {account.children.map((child, index) => 
              renderAccount(
                child, 
                level + 1, 
                index === account.children.length - 1
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const hierarchicalAccounts = buildHierarchy(accounts);

  return (
    <div className="chart-account-tree">
      <div className="tree-header">
        <div className="tree-legend">
          <span><FaFolder className="icon-folder" /> Conta Sintética</span>
          <span><FaFile className="icon-file" /> Conta Analítica</span>
        </div>
      </div>
      
      <div className="tree-content">
        {hierarchicalAccounts.map((account, index) => 
          renderAccount(
            account, 
            0, 
            index === hierarchicalAccounts.length - 1
          )
        )}
      </div>
    </div>
  );
}

export default SimpleChartAccountTree;