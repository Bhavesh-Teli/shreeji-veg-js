import { Layout, theme } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer: AntFooter } = Layout;
const Footer = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <AntFooter  className="custom-footer" style={{ background: token.colorPrimaryBg, color: '#fff', padding: '10px 10px', borderTop: "1px solid #fafafa", height: "50px", display: "flex", justifyContent: "center", alignItems: "center", }}>
      <div style={{ textAlign: 'center', marginTop: 0 }}>
        © {new Date().getFullYear()} {t('footer.copyright')}
      </div>
    </AntFooter>
  );
};

export default Footer;
