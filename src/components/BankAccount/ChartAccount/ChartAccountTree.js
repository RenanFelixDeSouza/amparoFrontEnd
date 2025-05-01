import React, { useState, useEffect, useRef } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import './ChartAccount.css';

function ChartAccountTree({ accounts = [], onSelect, selectedId }) {
  const [expandedItems, setExpandedItems] = useState({});
  const contentRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
        setShowLeftShadow(scrollLeft > 0);
        setShowRightShadow(scrollLeft < scrollWidth - clientWidth);
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }

    return () => {
      if (content) {
        content.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, []);

  const toggleExpand = (accountId) => {
    setExpandedItems(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const buildHierarchy = (items, parentId = null) => {
    const itemsArray = Array.isArray(items) ? items : [];
    return itemsArray
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildHierarchy(itemsArray, item.id)
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
        >
          <div className="account-info" onClick={() => onSelect(account)}>
            <span className="level-indicator" style={{ marginLeft: `${level * 24}px` }}>
              {level > 0 && (
                <span className="tree-line">
                  {isLastChild ? '└─' : '├─'}
                </span>
              )}
              {isSynthetic ? (
                <span className="folder-icon" onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) toggleExpand(account.id);
                }}>
                  {isExpanded ? <FaFolderOpen className="icon-folder" /> : <FaFolder className="icon-folder" />}
                  {hasChildren && (isExpanded ? 
                    <FaChevronDown className="icon-arrow" /> : 
                    <FaChevronRight className="icon-arrow" />
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
        <h3>Estrutura do Plano de Contas</h3>
        <div className="tree-legend">
          <span><FaFolder className="icon-folder" /> Conta Sintética</span>
          <span><FaFile className="icon-file" /> Conta Analítica</span>
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
      
      <div className="tree-content custom-scrollbar" ref={contentRef}>
        <div style={{ 
          display: 'inline-block', 
          minWidth: '100%',
          paddingRight: '20px',
          boxSizing: 'border-box'
        }}>
          {hierarchicalAccounts.map((account, index) => 
            renderAccount(
              account, 
              0, 
              index === hierarchicalAccounts.length - 1
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartAccountTree;