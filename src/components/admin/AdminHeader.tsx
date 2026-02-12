"use client";
import React from 'react';
import styles from '@/styles/admin.module.scss';
import { MdLogout } from 'react-icons/md';

export default function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className={styles.admin_header}>
      <div className="wrapper">
        <div className={styles.header_wrapper}>
          <h1>📊 Панель администратора</h1>
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
    </header>
  );
}
