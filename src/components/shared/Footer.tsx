import { Layout, theme } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer: AntFooter } = Layout;
const Footer = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <AntFooter
      className="custom-footer"
      style={{
        background: token.colorPrimaryBg,
        color: '#fff',
        padding: '10px 20px',
        borderTop: '1px solid #fafafa',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        className="logo-img"
        src="/rahulLogo.jpeg"
        alt="logo"
        style={{ height: '38px', marginBottom: '4px' ,borderRadius: '40%', marginRight: '10px'}}
      />
      <span style={{ fontSize: '14px' }}>
       {t('footer.copyright')} © {new Date().getFullYear()} {t('footer.right')}
      </span>
    </AntFooter>
  );
};

export default Footer;
