import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RemoteButton } from './RemoteButton';
import { Rocker } from './Rocker';
import { DPad } from './DPad';
import { NumberPad } from './NumberPad';
import { ColorKeys } from './ColorKeys';
import { StatusBadge } from './StatusBadge';
import { REMOTE_KEYS } from '../constants/keys';
import { RemoteTheme } from '../constants/theme';
import { samsungTvService } from '../services/samsungTv';

export interface RemoteChassisProps {
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export const RemoteChassis: React.FC<RemoteChassisProps> = ({
  onOpenSettings,
  onOpenOnboarding,
}) => {
  const handleKey = (keyCode: string) => {
    samsungTvService.sendKey(keyCode, 'Click');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.chassis}>
        {/* Top Status & Utility Bar */}
        <View style={styles.topBar}>
          <StatusBadge onPressSettings={onOpenSettings} />
        </View>

        {/* 1. POWER & SOURCE ROW */}
        <View style={styles.headerRow}>
          <RemoteButton
            label="POWER"
            icon="power"
            iconSize={20}
            variant="power"
            width={58}
            height={58}
            onPress={() => handleKey(REMOTE_KEYS.POWER.primaryKey)}
          />

          <View style={styles.headerUtilityButtons}>
            <RemoteButton
              icon="help-circle-outline"
              iconSize={20}
              variant="secondary"
              width={44}
              height={44}
              onPress={onOpenOnboarding}
            />
            <RemoteButton
              icon="settings-outline"
              iconSize={20}
              variant="secondary"
              width={44}
              height={44}
              onPress={onOpenSettings}
            />
          </View>

          <RemoteButton
            label="SOURCE"
            variant="standard"
            width={72}
            height={46}
            onPress={() => handleKey(REMOTE_KEYS.SOURCE.primaryKey)}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* 2. NUMBER PAD */}
        <NumberPad onKeyPress={handleKey} />

        <View style={styles.sectionDivider} />

        {/* 3. VOLUME, MUTE / CH LIST, CHANNEL ROCKERS */}
        <View style={styles.rockerRow}>
          {/* VOL ROCKER */}
          <Rocker
            title="VOL"
            topLabel="+"
            bottomLabel="-"
            onTopPress={() => handleKey(REMOTE_KEYS.VOL_UP.primaryKey)}
            onBottomPress={() => handleKey(REMOTE_KEYS.VOL_DOWN.primaryKey)}
          />

          {/* CENTER MUTE & CH LIST */}
          <View style={styles.rockerCenterColumn}>
            <RemoteButton
              label="MUTE"
              icon="volume-mute"
              iconSize={16}
              variant="standard"
              width={76}
              height={46}
              onPress={() => handleKey(REMOTE_KEYS.MUTE.primaryKey)}
              style={styles.roundedBtn}
            />
            <RemoteButton
              label="CH LIST"
              variant="standard"
              width={76}
              height={46}
              onPress={() => handleKey(REMOTE_KEYS.CH_LIST.primaryKey)}
              style={styles.roundedBtn}
            />
          </View>

          {/* CH ROCKER */}
          <Rocker
            title="CH"
            topLabel="▲"
            bottomLabel="▼"
            onTopPress={() => handleKey(REMOTE_KEYS.CH_UP.primaryKey)}
            onBottomPress={() => handleKey(REMOTE_KEYS.CH_DOWN.primaryKey)}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* 4. SLEEP, HOME, GUIDE */}
        <View style={styles.quickAccessRow}>
          <RemoteButton
            label="SLEEP"
            variant="standard"
            width={72}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.SLEEP.primaryKey)}
          />
          <RemoteButton
            icon="home"
            iconSize={22}
            variant="secondary"
            width={58}
            height={58}
            style={styles.homeButton}
            onPress={() => handleKey(REMOTE_KEYS.HOME.primaryKey)}
          />
          <RemoteButton
            label="GUIDE"
            variant="standard"
            width={72}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.GUIDE.primaryKey)}
          />
        </View>

        {/* 5. SETTINGS, D-PAD, INFO */}
        <View style={styles.dpadCluster}>
          <View style={styles.dpadSideButtonContainer}>
            <RemoteButton
              label="SETTINGS"
              variant="standard"
              width={70}
              height={44}
              onPress={() => handleKey(REMOTE_KEYS.SETTINGS.primaryKey)}
              textStyle={styles.microButtonText}
            />
          </View>

          <DPad
            onUp={() => handleKey(REMOTE_KEYS.UP.primaryKey)}
            onDown={() => handleKey(REMOTE_KEYS.DOWN.primaryKey)}
            onLeft={() => handleKey(REMOTE_KEYS.LEFT.primaryKey)}
            onRight={() => handleKey(REMOTE_KEYS.RIGHT.primaryKey)}
            onEnter={() => handleKey(REMOTE_KEYS.ENTER.primaryKey)}
          />

          <View style={styles.dpadSideButtonContainer}>
            <RemoteButton
              label="INFO"
              variant="standard"
              width={70}
              height={44}
              onPress={() => handleKey(REMOTE_KEYS.INFO.primaryKey)}
            />
          </View>
        </View>

        {/* 6. RETURN & EXIT */}
        <View style={styles.navControlsRow}>
          <RemoteButton
            label="RETURN"
            icon="arrow-undo-outline"
            iconSize={16}
            variant="standard"
            width={110}
            height={46}
            onPress={() => handleKey(REMOTE_KEYS.RETURN.primaryKey)}
          />
          <RemoteButton
            label="EXIT"
            icon="close-outline"
            iconSize={18}
            variant="standard"
            width={110}
            height={46}
            onPress={() => handleKey(REMOTE_KEYS.EXIT.primaryKey)}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* 7. COLOR BUTTONS (A, B, C, D) */}
        <ColorKeys onKeyPress={handleKey} />

        <View style={styles.sectionDivider} />

        {/* 8. E-MANUAL, P.SIZE, CC/VD, STOP */}
        <View style={styles.utilityRow}>
          <RemoteButton
            label="E-MANUAL"
            variant="standard"
            width={70}
            height={40}
            onPress={() => handleKey(REMOTE_KEYS.EMANUAL.primaryKey)}
            textStyle={styles.microButtonText}
          />
          <RemoteButton
            label="P.SIZE"
            variant="standard"
            width={70}
            height={40}
            onPress={() => handleKey(REMOTE_KEYS.P_SIZE.primaryKey)}
            textStyle={styles.microButtonText}
          />
          <RemoteButton
            label="CC/VD"
            variant="standard"
            width={70}
            height={40}
            onPress={() => handleKey(REMOTE_KEYS.CC_VD.primaryKey)}
            textStyle={styles.microButtonText}
          />
          <RemoteButton
            label="■"
            variant="standard"
            width={70}
            height={40}
            onPress={() => handleKey(REMOTE_KEYS.STOP.primaryKey)}
            textStyle={styles.stopIconText}
          />
        </View>

        {/* 9. MEDIA PLAYBACK ROW (<<, >, ||, >>) */}
        <View style={styles.mediaRow}>
          <RemoteButton
            icon="play-back"
            iconSize={20}
            variant="standard"
            width={64}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.REWIND.primaryKey)}
          />
          <RemoteButton
            icon="play"
            iconSize={20}
            variant="standard"
            width={64}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.PLAY.primaryKey)}
          />
          <RemoteButton
            icon="pause"
            iconSize={20}
            variant="standard"
            width={64}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.PAUSE.primaryKey)}
          />
          <RemoteButton
            icon="play-forward"
            iconSize={20}
            variant="standard"
            width={64}
            height={44}
            onPress={() => handleKey(REMOTE_KEYS.FAST_FORWARD.primaryKey)}
          />
        </View>

        {/* 10. PHYSICAL SAMSUNG LOGO */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>SAMSUNG</Text>
          <Text style={styles.modelText}>BN59-01301A</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.screenBackground,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  chassis: {
    width: '100%',
    maxWidth: RemoteTheme.dimensions.remoteMaxWidth,
    backgroundColor: RemoteTheme.colors.chassisBackground,
    borderRadius: 36,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#2d3039',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  topBar: {
    width: '100%',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  headerUtilityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionDivider: {
    height: 1,
    width: '90%',
    backgroundColor: RemoteTheme.colors.divider,
    marginVertical: 12,
  },
  rockerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 18,
    marginVertical: 4,
  },
  rockerCenterColumn: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 110,
  },
  roundedBtn: {
    borderRadius: 14,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  homeButton: {
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  dpadCluster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6,
    marginVertical: 8,
  },
  dpadSideButtonContainer: {
    width: 70,
    alignItems: 'center',
  },
  microButtonText: {
    fontSize: 9,
    fontWeight: '800',
  },
  navControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 36,
    marginVertical: 6,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  stopIconText: {
    fontSize: 16,
    color: '#ef4444',
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  brandContainer: {
    marginTop: 18,
    marginBottom: 6,
    alignItems: 'center',
  },
  brandText: {
    color: RemoteTheme.colors.samsungLogo,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4.5,
  },
  modelText: {
    color: RemoteTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});

