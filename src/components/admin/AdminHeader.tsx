"use client";
import React from 'react';
import styles from '@/styles/admin.module.scss';
import { MdLogout } from 'react-icons/md';

interface AdminHeaderProps {
  onLogout?: () => void;
  activeTab?: 'management' | 'statistics' | 'audit';
  onTabChange?: (tab: 'management' | 'statistics' | 'audit') => void;
}

export default function AdminHeader({ onLogout, activeTab = 'management', onTabChange }: AdminHeaderProps) {
  return (
    <header className={styles.admin_header}>
      <div className="wrapper">
        <div className={styles.header_wrapper}>
          <h1>Панель администратора</h1>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => onTabChange?.('management')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeTab === 'management' ? '#83B4FF' : 'transparent',
                  color: activeTab === 'management' ? '#000000' : '#A1A1A1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'management' ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
              >
                📋 Управление
              </button>
              <button
                onClick={() => onTabChange?.('statistics')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeTab === 'statistics' ? '#83B4FF' : 'transparent',
                  color: activeTab === 'statistics' ? '#000000' : '#A1A1A1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'statistics' ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
              >
                📊 Статистика
              </button>
              <button
                onClick={() => onTabChange?.('audit')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeTab === 'audit' ? '#83B4FF' : 'transparent',
                  color: activeTab === 'audit' ? '#000000' : '#A1A1A1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'audit' ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
              >
                🧾 Аудит
              </button>
            </nav>
            <button
              className={styles.logout_btn}
              onClick={() => {
                localStorage.removeItem('admin_token');
                if (onLogout) onLogout();
              }}
              title="Выйти из админ панели"
            >
              <MdLogout size={18} />
              <span>Выход</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

