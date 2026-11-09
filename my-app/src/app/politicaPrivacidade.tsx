import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';

export default function politicaPrivacidade(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabeçalho */}
        <Text style={styles.header}>
          POLÍTICA DE SEGURANÇA DO SISTEMA INTEGRADO CHRONOMEDI
        </Text>

        {/* 1. INTRODUÇÃO */}
        <Text style={styles.sectionTitle}>1. INTRODUÇÃO</Text>
        <Text style={styles.paragraph}>
          A segurança da informação é um dos pilares fundamentais da Chronomedi, garantindo a confidencialidade, a integridade e a disponibilidade dos dados e dos sistemas utilizados pela empresa. As práticas adotadas pela Chronomedi estão em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018) e incorporam seus princípios desde a concepção de seus sistemas e processos, assegurando a privacidade, a confiabilidade e a responsabilidade no tratamento das informações.
        </Text>
        <Text style={styles.paragraph}>
          Esta Política de Segurança da Informação estabelece as diretrizes, responsabilidades e medidas necessárias para proteger os dados pessoais dos usuários, bem como os ativos tecnológicos da Chronomedi, contra acessos não autorizados, uso indevido, divulgação, alteração, perda.
        </Text>

        {/* 2. OBJETIVO */}
        <Text style={styles.sectionTitle}>2. OBJETIVO</Text>
        <Text style={styles.paragraph}>
          Esta Política de Segurança da Informação tem como objetivo estabelecer diretrizes para garantir a proteção, o tratamento adequado e o uso seguro dos dados pessoais dos usuários do sistema Chronomedi, em conformidade com os princípios estabelecidos no Artigo 6º da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
        </Text>
        <Text style={styles.paragraph}>
          O sistema foi desenvolvido considerando o conceito de Privacy by Design (privacidade desde a concepção), garantindo que medidas de segurança e proteção de dados sejam aplicadas desde o desenvolvimento das funcionalidades até a utilização do sistema pelos usuários.
        </Text>
        <Text style={styles.paragraph}>
          A política busca assegurar a confidencialidade, integridade e disponibilidade das informações tratadas pelo sistema, garantindo que os usuários tenham controle sobre seus dados pessoais, incluindo o direito de consentir, consultar, atualizar e solicitar a exclusão das informações armazenadas.
        </Text>
        <Text style={styles.paragraph}>
          As diretrizes desta política são aplicadas por meio dos casos de uso definidos no Diagrama de Casos de Uso UML do sistema Chronomedi, destacando-se:
        </Text>
        <Text style={styles.bulletItem}>• Cadastrar-se: responsável pela criação da conta do usuário e coleta de dados pessoais necessários para utilização do sistema, seguindo os princípios de finalidade e necessidade da LGPD.</Text>
        <Text style={styles.bulletItem}>• Login: responsável pelo processo de autenticação do usuário, garantindo que somente pessoas autorizadas tenham acesso às informações cadastradas.</Text>
        <Text style={styles.bulletItem}>• Consentir com o uso de dados: permite que o usuário autorize de forma clara e explícita o tratamento de seus dados pessoais.</Text>
        <Text style={styles.bulletItem}>• Revogar consentimento do uso de dados: garante ao usuário o direito de retirar sua autorização para utilização dos dados pessoais.</Text>
        <Text style={styles.bulletItem}>• Consultar o uso de dados: permite que o usuário tenha transparência sobre quais informações são coletadas e como são utilizadas pelo sistema.</Text>
        <Text style={styles.bulletItem}>• Acessar e atualizar dados: possibilita que o usuário consulte e altere suas informações pessoais, garantindo controle sobre seus próprios dados.</Text>
        <Text style={styles.bulletItem}>• Acessar e atualizar dados sob permissão do usuário: garante que acessos realizados por terceiros, como assistência técnica, ocorram somente mediante autorização adequada.</Text>
        <Text style={styles.bulletItem}>• Solicitar exclusão: permite que o titular dos dados solicite a remoção de suas informações pessoais.</Text>
        <Text style={styles.bulletItem}>• Comunicar exclusão: garante transparência ao usuário sobre o processo de exclusão de seus dados.</Text>
        <Text style={styles.bulletItem}>• Excluir conta e dados: possibilita a remoção da conta e das informações armazenadas, conforme solicitação do usuário ou situações previstas nos Termos de Uso.</Text>
        <Text style={styles.bulletItem}>• Gerenciar informações no banco de dados: estabelece medidas de controle e segurança para o armazenamento e gerenciamento das informações pelo administrador do banco de dados.</Text>
        <Text style={styles.bulletItem}>• Sincronizar configurações e dados com o sistema: garante que a transferência de informações entre os dispositivos e o sistema ocorra de maneira segura.</Text>
        <Text style={styles.bulletItem}>• Exportar e importar dados/configurações: permite o gerenciamento das informações pelo usuário, mantendo a integridade e segurança dos dados.</Text>
        <Text style={styles.bulletItem}>• Configurar medicamentos, definir nome, horário, repetição e tipo de alerta: garante que as informações relacionadas à rotina do usuário sejam tratadas de forma segura, evitando acessos não autorizados.</Text>
        <Text style={styles.paragraph}>
          Dessa forma, a Política de Segurança da Informação do sistema Chronomedi busca integrar as funcionalidades apresentadas no modelo UML às exigências da LGPD, garantindo privacidade, segurança e transparência no tratamento dos dados pessoais dos usuários.
        </Text>

        {/* 3. ESCOPO */}
        <Text style={styles.sectionTitle}>3. ESCOPO</Text>
        <Text style={styles.paragraph}>
          Esta política se aplica a todos os funcionários, contratados, prestadores de serviços, parceiros e terceiros que tenham acesso aos sistemas e informações da Chronomedi.
        </Text>

        {/* 4. DIRETRIZES GERAIS */}
        <Text style={styles.sectionTitle}>4. DIRETRIZES GERAIS</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Confidencialidade:</Text> Todas as informações sensíveis devem ser acessíveis somente a indivíduos autorizados. O compartilhamento de informações deve ser limitado ao mínimo necessário.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Integridade:</Text> As informações devem ser protegidas contra alterações não autorizadas. Sistemas de controle de versões e backups regulares devem ser implementados para preservar a integridade dos dados.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Disponibilidade:</Text> As informações e os sistemas devem estar disponíveis para os usuários autorizados sempre que necessário, com medidas de contingência em vigor para garantir a continuidade dos negócios.
        </Text>

        {/* 5. CLASSIFICAÇÃO DA INFORMAÇÃO */}
        <Text style={styles.sectionTitle}>5. CLASSIFICAÇÃO DA INFORMAÇÃO</Text>
        <Text style={styles.paragraph}>
          Em nosso sistema existe a movimentação de dados como: Email, senha, nome e dados sobre os hábitos farmacêuticos de nossos usuários. Esses dados são utilizados para a autenticação da conta e utilização das funcionalidades do sistema, como a verificação das doses tomadas e quais medicamentos o usuário está consumindo. Nos certificamos que seus dados sejam utilizados somente para esses determinados fins.
        </Text>
        <Text style={styles.paragraph}>
          Todas as informações dos usuários são armazenadas de forma segura no Firebase, que atua como banco de dados principal do sistema. A ESP32 é responsável apenas por manter um banco de dados local contendo as informações dos medicamentos e alertas necessárias para o funcionamento da caixa, as quais são sincronizadas automaticamente com o Firebase.
        </Text>
        <Text style={styles.paragraph}>
          A comunicação entre o aplicativo e a caixa ocorre por meio da autenticação do usuário e da identificação da ESP32 vinculada à conta, garantindo que apenas dispositivos autorizados possam acessar e sincronizar as informações, preservando a confidencialidade, a integridade e a disponibilidade dos dados.
        </Text>

        {/* 5.1 Tipos de dados coletados */}
        <Text style={styles.subSectionTitle}>5.1 Tipos de dados coletados</Text>
        
        <Text style={styles.subSubTitle}>Usuário:</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Público (Dados não-pessoais):</Text> Nenhum dado desta classe se aplica a este nível. (Nenhum caso de uso relacionado).</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Confidencial (Dados pessoais):</Text> E-mail, Dados farmacêuticos, Nome, ID, Senha. (Atualizar dados e relatório para usuários premium).</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Restrito (Dados sensíveis):</Text> Nenhum dado desta classe se aplica a este nível. (Nenhum caso de uso relacionado).</Text>

        <Text style={styles.subSubTitle}>Medicamento:</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Público (Dados não-pessoais):</Text> Nenhum dado desta classe se aplica a este nível. (Nenhum caso de uso relacionado).</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Confidencial (Dados pessoais):</Text> Nome, Descrição, Via de administração. (Cadastrar medicamento, atualizar medicamento, excluir medicamento).</Text>
        <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Restrito (Dados sensíveis):</Text> ID, Data e hora, Dosagem, Frequência, quantidade. (Emitir alerta).</Text>

        <Text style={styles.paragraph}>
          Segundo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
        </Text>
        <Text style={styles.bulletItem}>• Art. 5º: Dados de saúde são considerados sensíveis.</Text>
        <Text style={styles.bulletItem}>• Art. 9º: O usuário deve ter acesso às informações coletadas.</Text>
        <Text style={styles.bulletItem}>• Art. 46: Exige medidas de segurança para proteção dos dados.</Text>
        <Text style={styles.paragraph}>
          O sistema deve garantir privacidade e segurança dos dados do usuário, exigindo validação para o tratamento dos dados coletados. Apenas utilizaremos os dados do usuário com a devida permissão e apenas da forma que especificamos em nossa política de segurança.
        </Text>

        <Text style={styles.paragraph}>
          Coletaremos dados do usuário como: Nome, ID, E-mail e Senha. Esses dados serão necessários para organizar as informações medicamentosas de um usuário, necessários para o relatório e autenticação da conta do usuário.
        </Text>
        <Text style={styles.paragraph}>
          Dados do medicamento como: Nome, Descrição, Via de administração, ID, Data e hora, Dosagem, Frequência e Quantidade. Esses dados serão necessários para: cadastrar o medicamento para a caixa de remédios alertar; atualizar os dados do medicamento; excluir o medicamento das opções de remédios a serem alertados na caixa organizadora; emitir o alerta do medicamento e mostrar os dados na tela da caixa (Data e hora, quantidade, nome, slot).
        </Text>

        <Text style={styles.paragraph}>
          Segundo o Marco Civil da Internet (Lei nº 12.965/2014):
        </Text>
        <Text style={styles.bulletItem}>• Art. 7º: Garante privacidade e proteção de dados.</Text>
        <Text style={styles.bulletItem}>• Art. 10: Dados só podem ser compartilhados com consentimento.</Text>
        <Text style={styles.paragraph}>
          Complementa a LGPD no ambiente digital, exigindo que o usuário autorize e permita com consentimento que os dados o qual ele fornece sejam compartilhados, utilizados e computados. Seus dados não serão compartilhados sem seu consentimento prévio.
        </Text>
        <Text style={styles.paragraph}>
          Para revogar o consentimento do uso de seus dados será necessário excluir a conta na tela de perfil, seus dados não serão mais armazenados na ESP32 e nem em nosso banco de dados.
        </Text>

        {/* 6. CONTROLE DE ACESSO */}
        <Text style={styles.sectionTitle}>6. CONTROLE DE ACESSO</Text>
        <Text style={styles.paragraph}>
          Quem tem acesso à conta e dados do usuário: Todos os dados cadastros pelo usuário, como dados sensíveis e dados de medicamentos serão armazenados na nuvem, sob criptografia no banco de dados da empresa Chronomedi, seguindo o princípio de menor privilégio.
        </Text>
        <Text style={styles.paragraph}>
          Ao concordar com o termo, o usuário aceita fornecer dados tanto sensíveis quanto não sensíveis à empresa Chronomedi, e consente com o compartilhamento dos dados não sensíveis com terceiros.
        </Text>
        <Text style={styles.paragraph}>Ao prosseguir, você concorda que:</Text>
        <Text style={styles.bulletItem}>• O usuário poderá consultar o uso de dados e opcionalmente consentir com o uso de dados. Também poderá revogar o consentimento ao uso de dados, mediante exclusão da conta e dados. O acesso ao sistema só é fornecido mediante acordo total ao Termos de Uso de Dados.</Text>
        <Text style={styles.bulletItem}>• O usuário poderá acessar e atualizar os dados cadastrados e, opcionalmente, solicitar a exclusão de sua conta e dados. O descumprimento dos termos de uso resultará na exclusão automática da conta.</Text>
        <Text style={styles.bulletItem}>• O usuário poderá cadastrar informações dos medicamentos que irá utilizar, como nome, horário de administração, frequência/repetições, dosagem, via de administração e descrição, e slot da caixa.</Text>
        <Text style={styles.bulletItem}>• Para ter acesso ao sistema, o usuário deve vincular o IP da caixa Chronobox à sua conta. Cada IP é individual e exclusivo à cada caixa.</Text>
        <Text style={styles.bulletItem}>• O usuário poderá exportar o relatório de uso de medicamento de acordo com o período desejado, caso possua assinatura premium no sistema. O relatório permanecerá no banco de dados da Chronobox, e as informações atreladas a ele serão excluídas automaticamente após um período de 30 dias.</Text>

        {/* 7. SEÇÃO ESPECÍFICA LGPD */}
        <Text style={styles.sectionTitle}>7. SEÇÃO ESPECÍFICA LGPD – DIREITOS DOS TITULARES</Text>
        
        <Text style={styles.subSectionTitle}>7.1. Armazenamento dos Dados</Text>
        <Text style={styles.paragraph}>
          O Chronomedi utiliza dois ambientes de armazenamento de dados diferentes, cada um com uma finalidade específica, visando garantir o funcionamento do sistema e a proteção das informações dos usuários.
        </Text>
        <Text style={styles.paragraph}>
          O Firebase é o banco de dados principal do sistema, sendo responsável pelo armazenamento de todas as informações relacionadas ao usuário, incluindo dados de autenticação, identificação, configurações da conta, medicamentos cadastrados, horários de administração, dosagens, compartimentos, histórico de administrações e demais informações necessárias para o funcionamento do ChronoApp.
        </Text>
        <Text style={styles.paragraph}>
          A placa ESP32 possui um banco de dados local destinado exclusivamente ao funcionamento da caixa de medicamentos. Esse banco armazena apenas as informações indispensáveis para a operação do dispositivo, como os medicamentos cadastrados, seus respectivos horários de administração, quantidades, compartimentos associados e alertas programados. Esses dados são sincronizados automaticamente a partir do banco de dados principal armazenado no Firebase, permitindo que a caixa continue operando mesmo em situações de instabilidade temporária na conexão com a internet.
        </Text>
        <Text style={styles.paragraph}>
          O aplicativo atua como intermediador da comunicação entre o Firebase e a ESP32, realizando a autenticação do usuário, a identificação da caixa de medicamentos vinculada à conta e a sincronização das informações necessárias para manter o banco de dados local da ESP32 sempre atualizado.
        </Text>

        <Text style={styles.subSectionTitle}>7.2. Direitos dos Titulares de Dados</Text>
        <Text style={styles.paragraph}>
          Em conformidade com o Art. 18 da Lei Geral de Proteção de Dados (LGPD), o usuário poderá exercer os seguintes direitos:
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Acessar seus dados pessoais:</Text> visualizar todos os dados pessoais e operacionais armazenados no Firebase, bem como consultar, por meio do aplicativo, as informações sincronizadas e armazenadas localmente na ESP32, incluindo medicamentos cadastrados, horários, dosagens, compartimentos e alertas programados. (Telas: "Perfil", "Home")
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Corrigir dados incorretos:</Text> alterar informações pessoais, configurações da conta e dados dos medicamentos armazenados no Firebase. Após a atualização, as alterações serão sincronizadas automaticamente com o banco de dados local da ESP32. (Telas: "Conta e Dados", "Perfil", "Home" e "Cadastro de Medicamentos")
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Solicitar a exclusão dos dados:</Text> solicitar a exclusão da conta e dos dados pessoais armazenados no Firebase. Após a exclusão, os dados sincronizados na ESP32 também serão excluídos ou substituídos conforme o processo de sincronização do sistema, observadas as obrigações legais aplicáveis. (Tela: "Conta e Dados")
        </Text>

        <Text style={styles.subSectionTitle}>7.3. Bases Legais do Tratamento</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Consentimento (Art. 7º, inciso I da LGPD):</Text> obtido durante o primeiro acesso ao aplicativo, quando o usuário lê e concorda com os Termos de Uso e a Política de Privacidade antes de utilizar o sistema.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Execução de contrato (Art. 7º, inciso V da LGPD):</Text> o tratamento dos dados é necessário para possibilitar a autenticação do usuário no Firebase, a associação da conta à caixa de medicamentos, a sincronização entre o Firebase e a ESP32, o gerenciamento dos medicamentos, a programação dos alertas e o funcionamento adequado do Chronomedi.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Legítimo interesse (Art. 7º, inciso IX da LGPD):</Text> utilizado para garantir a segurança e a confiabilidade do sistema, por meio do registro de logs de funcionamento, do monitoramento da comunicação entre o aplicativo, o Firebase e a ESP32, para identificação de falhas, prevenção de acessos não autorizados, e preservação da integridade, disponibilidade e consistência dos dados armazenados.
        </Text>

        {/* 8. SEGURANÇA TÉCNICA */}
        <Text style={styles.sectionTitle}>8. SEGURANÇA TÉCNICA</Text>
        <Text style={styles.paragraph}>
          A segurança técnica do sistema Chronomedi has como objetivo garantir a proteção dos dados pessoais tratados pela aplicação, adotando medidas de segurança capazes de prevenir acessos não autorizados, perda, alteração, destruição ou qualquer forma de tratamento inadequado das informações, conforme estabelecido no Artigo 46 da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
        </Text>
        <Text style={styles.paragraph}>
          Para garantir a segurança das informações, o sistema utiliza medidas técnicas relacionadas às funcionalidades apresentadas no Diagrama de Casos de Uso UML, conforme descrito abaixo:
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Controle de acesso e autenticação de usuários (Caso de uso "Login"):</Text> O sistema utiliza mecanismos de autenticação para garantir que somente usuários autorizados tenham acesso às informações pessoais e configurações cadastradas. A autenticação é realizada por meio do Firebase Authentication, contribuindo para a proteção contra acessos indevidos e assegurando maior segurança no tratamento dos dados.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Controle de permissões de acesso (Caso de uso "Acessar e atualizar dados sob permissão do usuário"):</Text> O acesso e a alteração das informações pessoais ocorrem somente mediante autorização do usuário, garantindo que terceiros, como assistência técnica, tenham acesso limitado e controlado às informações estritamente necessárias para a execução de suas atividades. Esse controle é reforçado por regras de segurança que restringem o acesso aos dados conforme as permissões definidas.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Gerenciamento seguro das informações armazenadas (Caso de uso "Gerenciar informações no banco de dados"):</Text> As informações armazenadas são protegidas por mecanismos de controle de acesso, regras de segurança e permissões administrativas, garantindo que apenas usuários e administradores autorizados possam visualizar, modificar ou gerenciar os dados armazenados no Cloud Firestore.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Proteção na comunicação entre dispositivos e sistema (Caso de uso "Sincronizar configurações e dados com o sistema"):</Text> A sincronização das configurações e dos dados do usuário ocorre por meio de comunicação segura entre o aplicativo e os servidores, utilizando protocolos de criptografia que garantem a confidencialidade e a integridade das informações durante a transmissão.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Controle do tratamento de dados pessoais (Casos de uso "Consentir com o uso de dados" e "Revogar consentimento do uso de dados"):</Text> O sistema permite que o usuário tenha controle sobre seus dados pessoais, possibilitando conceder ou revogar o consentimento para o tratamento das informações, em conformidade com os direitos previstos pela LGPD.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Exclusão segura das informações (Casos de uso "Solicitar exclusão" e "Excluir conta e dados"):</Text> O sistema permite que o usuário solicite a exclusão de sua conta e de seus dados pessoais, garantindo que as informações sejam removidas de acordo com as políticas internas da aplicação e os direitos assegurados pela LGPD.
        </Text>
        <Text style={styles.paragraph}>
          Além das funcionalidades apresentadas no diagrama UML, o sistema adota medidas técnicas complementares de segurança, como criptografia dos dados armazenados e transmitidos, utilização de regras de segurança para controle de acesso, registros de atividades quando aplicáveis e monitoramento de vulnerabilidades, com o objetivo de reforçar a proteção das informações pessoais e atender às boas práticas de segurança da informação.
        </Text>
        <Text style={styles.paragraph}>
          As medidas de segurança descritas nesta política são implementadas utilizando os recursos oferecidos pela plataforma Firebase, incluindo o Firebase Authentication para autenticação dos usuários, o Cloud Firestore para armazenamento dos dados e as Firebase Security Rules para controle de acesso às informações, complementados pelos mecanismos de criptografia e infraestrutura segura fornecidos pela Google.
        </Text>

        {/* 9. USO DE DISPOSITIVOS E REDE */}
        <Text style={styles.sectionTitle}>9. USO DE DISPOSITIVOS E REDE</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Dispositivos Pessoais:</Text> O uso de dispositivos pessoais para acessar informações da empresa deve ser limitado e autorizado pela equipe de TI.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Rede Segura:</Text> A conexão a redes públicas ou desconhecidas para acessar informações da empresa deve ser evitada. Redes virtuais privadas (VPNs) devem ser usadas quando necessário.
        </Text>

        {/* 10. TREINAMENTO E CONSCIENTIZAÇÃO */}
        <Text style={styles.sectionTitle}>10. TREINAMENTO E CONSCIENTIZAÇÃO</Text>
        <Text style={styles.paragraph}>
          A equipe responsável pelo desenvolvimento e administração do sistema Chronomedi receberá treinamentos periódicos sobre Segurança da Informação e Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018), garantindo que todos compreendam suas responsabilidades no tratamento de dados pessoais.
        </Text>
        <Text style={styles.paragraph}>Os treinamentos abordarão os seguintes temas:</Text>
        <Text style={styles.bulletItem}>• Princípios da Segurança da Informação (Confidencialidade, Integridade e Disponibilidade – Tríade CIA);</Text>
        <Text style={styles.bulletItem}>• Direitos dos titulares de dados previstos na LGPD;</Text>
        <Text style={styles.bulletItem}>• Boas práticas para coleta, armazenamento e tratamento de dados pessoais;</Text>
        <Text style={styles.bulletItem}>• Utilização correta das funcionalidades do sistema relacionadas à privacidade, como Solicitar Consentimento, Gerenciar Preferências, Criptografar Dados Pessoais e Excluir Conta;</Text>
        <Text style={styles.bulletItem}>• Procedimentos para atendimento às solicitações dos usuários, como acesso, correção e exclusão de dados;</Text>
        <Text style={styles.bulletItem}>• Identificação e comunicação de incidentes de segurança da informação.</Text>
        <Text style={styles.paragraph}>
          Os treinamentos serão realizados durante a integração de novos colaboradores e periodicamente para atualização das boas práticas e das exigências legais, fortalecendo a cultura de segurança e proteção de dados dentro da organização.
        </Text>

        {/* 11. RESPOSTA A INCIDENTES */}
        <Text style={styles.sectionTitle}>11. RESPOSTA A INCIDENTES</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Relatório de Incidentes:</Text> Todos os incidentes de segurança devem ser reportados imediatamente ao departamento de TI ou ao responsável pela segurança da informação.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Gestão de Incidentes:</Text> A equipe de resposta a incidentes deve investigar, documentar e mitigar os efeitos de qualquer incidente de segurança.
        </Text>

        {/* 12. CONFORMIDADE E AUDITORIA */}
        <Text style={styles.sectionTitle}>12. CONFORMIDADE E AUDITORIA</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Conformidade:</Text> A Chronomedi deve assegurar o cumprimento de todas as leis e regulamentações aplicáveis relacionadas à segurança da informação.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>Auditorias Regulares:</Text> Auditorias internas e externas devem ser conduzidas regularmente para garantir a aderência a esta política.
        </Text>

        {/* 13. REVISÃO POLÍTICA */}
        <Text style={styles.sectionTitle}>13. REVISÃO POLÍTICA</Text>
        <Text style={styles.paragraph}>
          Esta política deve ser revisada anualmente, ou sempre que necessário, para garantir sua eficácia e conformidade com as mudanças legais e tecnológicas.
        </Text>

        {/* 14. COMUNICAÇÃO DO USUARIO */}
        <Text style={styles.sectionTitle}>14. COMUNICAÇÃO DO USUÁRIO</Text>
        <Text style={styles.paragraph}>Prezado(a) usuário(a),</Text>
        <Text style={styles.paragraph}>
          O Chronomedi está comprometido com a proteção dos seus dados pessoais e com o cumprimento da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
        </Text>
        <Text style={styles.paragraph}>
          As informações fornecidas por você, como nome, e-mail e dados relacionados ao uso de medicamentos, são utilizadas exclusivamente para oferecer as funcionalidades do sistema, como lembretes de medicação, acompanhamento do histórico e gerenciamento do tratamento.
        </Text>
        <Text style={styles.paragraph}>Para garantir sua privacidade e segurança, o Chronomedi adota medidas como:</Text>
        <Text style={styles.bulletItem}>• Solicitação de consentimento para o tratamento de dados pessoais;</Text>
        <Text style={styles.bulletItem}>• Criptografia das informações armazenadas e transmitidas;</Text>
        <Text style={styles.bulletItem}>• Controle de acesso às informações;</Text>
        <Text style={styles.bulletItem}>• Registro de atividades para fins de auditoria e segurança;</Text>
        <Text style={styles.bulletItem}>• Possibilidade de consultar, corrigir ou excluir seus dados pessoais quando permitido pela legislação.</Text>
        <Text style={styles.paragraph}>
          O sistema também utiliza cookies essenciais para manter seu funcionamento adequado. Caso sejam utilizados cookies de desempenho ou personalização, sua autorização será solicitada previamente, e você poderá gerenciar suas preferências a qualquer momento.
        </Text>
        <Text style={styles.paragraph}>
          Ao aceitar os Termos de Uso e a Política de Privacidade, você declara estar ciente sobre a forma como seus dados são tratados e sobre os seus direitos garantidos pela LGPD, incluindo acesso, correção, exclusão e revogação do consentimento.
        </Text>
        <Text style={styles.paragraph}>
          Nosso compromisso é oferecer um ambiente seguro, transparente e confiável, garantindo que seus dados sejam protegidos durante toda a utilização do Chronomedi.
        </Text>

        <View style={styles.divider} />

        {/* TERMOS DE USO */}
        <Text style={styles.header}>TERMOS DE USO DE SOFTWARE</Text>
        <Text style={styles.paragraph}><Text style={styles.boldText}>Última Atualização:</Text> 05/08/2026</Text>

        <Text style={styles.sectionTitle}>1. ACEITAÇÃO DOS TERMOS</Text>
        <Text style={styles.paragraph}>
          Ao baixar, instalar, acessar ou usar o software ChronoApp, você concorda em cumprir e estar legalmente vinculado aos seguintes Termos de Uso. Se você não concorda com estes termos, não deve utilizar o software.
        </Text>

        <Text style={styles.sectionTitle}>2. LICENÇA DE USO</Text>
        <Text style={styles.subSectionTitle}>2.1 Concessão de Licença</Text>
        <Text style={styles.paragraph}>
          Sujeito ao cumprimento destes Termos de Uso, a Chronomedi concede a você uma licença limitada, não exclusiva, intransferível e revogável para usar o software ChronoApp apenas para fins pessoais e não comerciais.
        </Text>
        <Text style={styles.subSectionTitle}>2.2 Restrições de Uso</Text>
        <Text style={styles.paragraph}>
          Você concorda em não (a) copiar, modificar ou criar obras derivadas do software; (b) realizar engenharia reversa, descompilar, ou tentar extrair o código-fonte do software; (c) alugar, arrendar, sublicenciar, ou distribuir o software para terceiros.
        </Text>

        <Text style={styles.sectionTitle}>3. ATUALIZAÇÕES</Text>
        <Text style={styles.paragraph}>
          A ChronoApp pode fornecer atualizações, correções de bugs ou outras modificações do software periodicamente. Essas atualizações podem ser instaladas automaticamente, e você concorda em receber essas atualizações como parte do seu uso contínuo do software.
        </Text>

        <Text style={styles.sectionTitle}>4. PROPRIEDADE INTELECTUAL</Text>
        <Text style={styles.paragraph}>
          Todos os direitos, títulos e interesses relacionados ao software, incluindo, sem limitação, todos os direitos autorais, patentes, segredos comerciais, marcas registradas e outros direitos de propriedade intelectual são de propriedade exclusiva da Chronomedi. Estes Termos de Uso não concedem a você qualquer direito de propriedade intelectual sobre o software.
        </Text>

        <Text style={styles.sectionTitle}>5. COLETA DE DADOS E PRIVACIDADE</Text>
        <Text style={styles.subSectionTitle}>5.1 Coleta de Dados</Text>
        <Text style={styles.paragraph}>
          A Chronomedi pode coletar informações sobre o uso do software, incluindo dados técnicos e informações relacionadas ao desempenho, para melhorar a funcionalidade do software.
        </Text>
        <Text style={styles.subSectionTitle}>5.2 Política de Privacidade</Text>
        <Text style={styles.paragraph}>
          O uso do software está sujeito à Política de Privacidade da Chronomedi.
        </Text>

        <Text style={styles.sectionTitle}>6. LIMITAÇÃO DE RESPONSABILIDADE</Text>
        <Text style={styles.paragraph}>
          Em nenhuma circunstância a Chronomedi será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da incapacidade de usar o software, mesmo que a Chronomedi tenha sido avisada da possibilidade de tais danos.
        </Text>

        <Text style={styles.sectionTitle}>7. GARANTIA LIMITADA</Text>
        <Text style={styles.paragraph}>
          O software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a garantias de comercialização, adequação a um propósito específico ou não violação.
        </Text>

        <Text style={styles.sectionTitle}>8. RESCISÃO</Text>
        <Text style={styles.paragraph}>
          Estes Termos de Uso são efetivos até serem rescindidos. A Chronomedi pode rescindir estes Termos de Uso a qualquer momento, sem aviso prévio, se você violar qualquer uma das disposições aqui contidas. Após a rescisão, você deve cessar todo o uso do software e destruir todas as cópias do software em sua posse.
        </Text>

        <Text style={styles.sectionTitle}>9. DISPOSIÇÕES GERAIS</Text>
        <Text style={styles.subSectionTitle}>9.1 Legislação Aplicável</Text>
        <Text style={styles.paragraph}>
          Estes Termos de Uso serão regidos e interpretados de acordo com as leis do Brasil/São Paulo, sem consideração aos conflitos de leis.
        </Text>
        <Text style={styles.subSectionTitle}>9.2 Alterações aos Termos</Text>
        <Text style={styles.paragraph}>
          A Chronomedi reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As modificações serão efetivas quando publicadas no site da Chronomedi ou quando notificadas a você por qualquer outro meio.
        </Text>
        <Text style={styles.subSectionTitle}>9.3 Acordo Integral</Text>
        <Text style={styles.paragraph}>
          Estes Termos de Uso constituem o acordo integral entre você e a Chronomedi em relação ao uso do software e substituem todos os entendimentos ou acordos anteriores, escritos ou orais, relativos ao assunto.
        </Text>

        <Text style={styles.sectionTitle}>10. CONTATO</Text>
        <Text style={styles.paragraph}>
          Se você tiver dúvidas sobre estes Termos de Uso, entre em contato com a Chronomedi em <Text style={styles.boldText}>chonomedi.contato@gmail.com</Text>.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 18,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 6,
  },
  subSubTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: '#000000',
    marginBottom: 10,
    textAlign: 'justify',
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#000000',
    marginBottom: 6,
    paddingLeft: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  metaContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 24,
  },
});